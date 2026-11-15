import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, DragEvent, KeyboardEvent } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  FileImage,
  Files,
  Image as ImageIcon,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { formatDisplayName } from "../lib/formats";
import type { OutputFormat } from "../lib/formats";

type FileStatus = "ready" | "converting" | "done" | "error";

interface ConversionFile {
  id: string;
  sourceId: string;
  file: File;
  status: FileStatus;
  outputName?: string;
  outputBlob?: Blob;
  outputUrl?: string;
  width?: number;
  height?: number;
  error?: string;
}

interface ConverterProps {
  initialFormat?: OutputFormat;
}

const MAX_RECOMMENDED_SIZE = 50 * 1024 * 1024;
const MIN_QUALITY_PERCENT = 10;

const formatOptions: { value: OutputFormat; label: string; hint: string }[] = [
  { value: "jpg", label: "JPG", hint: "Smaller file" },
  { value: "png", label: "PNG", hint: "Lossless" },
  { value: "webp", label: "WebP", hint: "Modern web" },
];

const mimeTypeFor = (value: OutputFormat) =>
  value === "png" ? "image/png" : value === "webp" ? "image/webp" : "image/jpeg";

const supportsWebp = () => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
};

// heic2any only accepts png/jpeg/gif; WebP is produced by re-encoding the decoded PNG on a canvas.
const encodeWebp = async (source: Blob, quality: number): Promise<Blob> => {
  const bitmap = await createImageBitmap(source);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob || blob.type === "image/png") {
      throw new Error("This browser could not encode WebP. Try a current version of Chrome, Edge, Firefox, or Safari.");
    }
    return blob.type === "image/webp" ? blob : new Blob([blob], { type: "image/webp" });
  } finally {
    bitmap.close();
  }
};

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
};

const makeOutputName = (file: File, format: OutputFormat, index: number, total: number) => {
  const base = file.name.replace(/\.(heic|heif)$/i, "").replace(/[\\/:*?"<>|]/g, "-") || "photo";
  return `${base}${total > 1 ? `_${index + 1}` : ""}.${format}`;
};

const isHeicFile = (file: File) => {
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif") || /image\/hei[cf]/i.test(file.type);
};

const makePendingFile = (file: File): ConversionFile => {
  const id = makeId();
  return { id, sourceId: id, file, status: "ready" };
};

const readDimensions = async (blob: Blob, url: string) => {
  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(blob);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    }
    return await new Promise<{ width: number; height: number } | undefined>((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve(undefined);
      image.src = url;
    });
  } catch {
    return undefined;
  }
};

export default function Converter({ initialFormat = "jpg" }: ConverterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const conversionRunningRef = useRef(false);
  const filesRef = useRef<ConversionFile[]>([]);
  const [format, setFormat] = useState<OutputFormat>(initialFormat);
  const [quality, setQuality] = useState(0.9);
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState({ active: false, total: 0, completed: 0, message: "" });
  filesRef.current = files;

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => {
        if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
      });
    };
  }, []);

  const isConverting = files.some((item) => item.status === "converting");
  const busy = isConverting || progress.active || conversionRunningRef.current;
  const progressPercent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  const doneCount = files.filter((item) => item.status === "done").length;
  const pendingCount = files.filter((item) => item.status === "ready" || item.status === "error").length;
  const allDone = files.length > 0 && pendingCount === 0 && !busy;

  const clearOutput = (item: ConversionFile) => {
    if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
  };

  const resetToPending = (rows: ConversionFile[]) => {
    const seen = new Set<string>();
    const pending: ConversionFile[] = [];
    rows.forEach((item) => {
      clearOutput(item);
      const sourceId = item.sourceId || item.id;
      if (!seen.has(sourceId)) {
        seen.add(sourceId);
        pending.push({ id: sourceId, sourceId, file: item.file, status: "ready" });
      }
    });
    return pending;
  };

  const changeFormat = (nextFormat: OutputFormat) => {
    if (nextFormat === format || busy) return;
    const hadConvertedFiles = doneCount > 0;
    if (hadConvertedFiles) {
      setFiles(resetToPending(files));
    }
    setFormat(nextFormat);
    setNotice(
      hadConvertedFiles
        ? `Output changed to ${formatDisplayName(nextFormat)}. Click Convert to apply the new format.`
        : "",
    );
  };

  const changeQuality = (value: number) => {
    if (value === quality || busy) return;
    if (doneCount > 0) {
      setFiles(resetToPending(files));
      setNotice("Quality updated. Click Convert to apply the new setting.");
    }
    setQuality(value);
  };

  const convertOne = async (item: ConversionFile) => {
    const createdUrls: string[] = [];
    setFiles((current) =>
      current.map((file) => (file.id === item.id ? { ...file, status: "converting", error: undefined } : file)),
    );
    try {
      const { default: heic2any } = await import("heic2any");
      const mimeType = mimeTypeFor(format);
      if (format === "webp" && !supportsWebp()) {
        throw new Error("WebP output is not supported in this browser. Try a current version of Chrome, Edge, Firefox, or Safari.");
      }
      const result = await heic2any({
        blob: item.file,
        toType: format === "webp" ? "image/png" : mimeType,
        quality: format === "png" || format === "webp" ? undefined : quality,
        multiple: true,
      });
      const converted = Array.isArray(result) ? result : [result];
      if (!converted.length || !converted[0]) throw new Error("No images were found in this HEIC file.");
      const outputs: ConversionFile[] = [];
      for (let index = 0; index < converted.length; index += 1) {
        const sourceBlob = converted[index];
        const outputBlob =
          format === "webp"
            ? await encodeWebp(sourceBlob, quality)
            : sourceBlob.type === mimeType
              ? sourceBlob
              : new Blob([sourceBlob], { type: mimeType });
        const outputUrl = URL.createObjectURL(outputBlob);
        createdUrls.push(outputUrl);
        const dimensions = await readDimensions(outputBlob, outputUrl);
        outputs.push({
          id: makeId(),
          sourceId: item.sourceId,
          file: item.file,
          status: "done",
          outputName: makeOutputName(item.file, format, index, converted.length),
          outputBlob,
          outputUrl,
          width: dimensions?.width,
          height: dimensions?.height,
        });
      }
      setFiles((current) => current.flatMap((file) => (file.id === item.id ? outputs : [file])));
    } catch (error) {
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
      const detail = error instanceof Error && error.message ? error.message : "Conversion failed";
      const message =
        detail.length > 110
          ? "This file could not be decoded. It may be damaged or use an unsupported HEIC variant."
          : detail;
      setFiles((current) =>
        current.map((file) =>
          file.id === item.id ? { ...file, status: "error", error: message } : file,
        ),
      );
    }
  };

  const convertItems = async (items: ConversionFile[]) => {
    if (!items.length || conversionRunningRef.current) return;
    conversionRunningRef.current = true;
    setProgress({ active: true, total: items.length, completed: 0, message: "Initializing converter..." });
    try {
      for (let index = 0; index < items.length; index += 1) {
        setProgress((current) => ({
          ...current,
          completed: index,
          message: `Converting ${items[index].file.name}...`,
        }));
        await convertOne(items[index]);
        setProgress((current) => ({
          ...current,
          completed: index + 1,
          message: `Converted ${index + 1} of ${items.length} file${items.length === 1 ? "" : "s"}`,
        }));
      }
    } finally {
      conversionRunningRef.current = false;
      setProgress((current) => ({ ...current, active: false, message: "" }));
    }
  };

  const addFiles = (incoming: File[]) => {
    if (!incoming.length || conversionRunningRef.current || filesRef.current.some((item) => item.status === "converting")) return;
    const invalid = incoming.filter((file) => !isHeicFile(file));
    if (invalid.length) {
      setNotice(
        invalid.length === incoming.length
          ? "Please choose valid HEIC or HEIF files. Other formats are not supported."
          : `This batch contains ${invalid.length} unsupported file${invalid.length === 1 ? "" : "s"}. Please choose HEIC or HEIF photos only.`,
      );
      return;
    }
    const oversized = incoming.filter((file) => file.size > MAX_RECOMMENDED_SIZE);
    const newItems = incoming.map(makePendingFile);
    setFiles((current) => [...current, ...newItems]);
    setNotice(
      oversized.length
        ? `${oversized.length} file${oversized.length === 1 ? " is" : "s are"} larger than 50 MB. Conversion depends on your device's available memory.`
        : "",
    );
    void convertItems(newItems);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!busy) addFiles(Array.from(event.dataTransfer.files));
  };

  const onDropzoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (files.length === 0 && !busy && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const removeFile = (id: string) => {
    if (busy) return;
    setFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target) clearOutput(target);
      return current.filter((item) => item.id !== id);
    });
    setNotice("");
  };

  const clearFiles = () => {
    if (busy) return;
    files.forEach(clearOutput);
    setFiles([]);
    setProgress({ active: false, total: 0, completed: 0, message: "" });
    setNotice("");
  };

  const convertAll = () => {
    const pending = files.filter((item) => item.status === "ready" || item.status === "error");
    if (!pending.length || busy) return;
    setNotice("");
    void convertItems(pending);
  };

  const downloadFile = (item: ConversionFile) => {
    if (!item.outputUrl) return;
    const anchor = document.createElement("a");
    anchor.href = item.outputUrl;
    anchor.download = item.outputName || makeOutputName(item.file, format, 0, 1);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const downloadZip = async () => {
    const convertedFiles = files.filter((item) => item.status === "done" && item.outputBlob);
    if (!convertedFiles.length || zipping || busy) return;
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const usedNames = new Set<string>();
      convertedFiles.forEach((item) => {
        const originalName = item.outputName || makeOutputName(item.file, format, 0, 1);
        let name = originalName;
        let suffix = 2;
        while (usedNames.has(name)) {
          name = originalName.replace(new RegExp(`\\.${format}$`), `-${suffix}.${format}`);
          suffix += 1;
        }
        usedNames.add(name);
        if (item.outputBlob) zip.file(name, item.outputBlob);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `heic-to-${format}-photos.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setNotice("The ZIP file could not be created. You can still download each converted photo individually.");
    } finally {
      setZipping(false);
    }
  };

  return (
    <section className="converter-shell" aria-label="HEIC photo converter">
      <div className="converter-heading">
        <div>
          <span className="section-kicker">YOUR PRIVATE WORKSPACE</span>
          <h2>Convert HEIC photos</h2>
        </div>
        <div className="local-badge"><LockKeyhole size={15} /> Files stay on this device</div>
      </div>

      <div className="converter-settings">
        <div className="format-setting">
          <label>Output format</label>
          <div className="format-switch" role="group" aria-label="Output format">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={format === option.value ? "active" : ""}
                onClick={() => changeFormat(option.value)}
                disabled={busy}
                aria-pressed={format === option.value}
              >
                <span>{option.label}</span>
                <small>{option.hint}</small>
                {format === option.value && <Check size={15} />}
              </button>
            ))}
          </div>
        </div>
        <div className="quality-setting">
          <div className="quality-label">
            <label htmlFor="quality-slider">Image quality</label>
            <span>{format === "png" ? "Lossless" : `${Math.round(quality * 100)}%`}</span>
          </div>
          {format !== "png" ? (
            <>
              <input
                id="quality-slider"
                type="range"
                min={MIN_QUALITY_PERCENT}
                max="100"
                step="1"
                value={quality * 100}
                onChange={(event) => changeQuality(Number(event.target.value) / 100)}
                disabled={busy}
                style={{ "--range-progress": `${((quality * 100 - MIN_QUALITY_PERCENT) / (100 - MIN_QUALITY_PERCENT)) * 100}%` } as CSSProperties}
              />
              <div className="range-labels"><span>Smaller size</span><span>Best quality</span></div>
            </>
          ) : (
            <div className="png-quality-note"><ShieldCheck size={17} /> PNG preserves image detail without JPEG compression.</div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        onChange={onInputChange}
        aria-label="Choose HEIC or HEIF files"
      />

      <div
        className={`dropzone ${dragging ? "dragging" : ""} ${files.length ? "has-files" : ""}`}
        role={files.length ? undefined : "button"}
        tabIndex={files.length ? -1 : 0}
        aria-label={files.length ? undefined : "Choose or drop HEIC files"}
        onKeyDown={onDropzoneKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {files.length === 0 ? (
          <>
            <div className="file-illustration" aria-hidden="true">
              <div className="illustration-file source-file"><FileImage size={28} /><span>HEIC</span></div>
              <div className="illustration-arrow"><ArrowRight size={20} /></div>
              <div className="illustration-file output-file"><ImageIcon size={28} /><span>{formatDisplayName(format)}</span></div>
              <div className="illustration-spark">✦</div>
            </div>
            <h3>Drop your HEIC photos here</h3>
            <p>or choose files from your device</p>
            <button className="button button-primary browse-button" type="button" onClick={() => inputRef.current?.click()}>
              <UploadCloud size={19} /> Choose HEIC files
            </button>
            <span className="dropzone-note">Batch upload · 50 MB recommended per file · No sign-up · No watermark</span>
          </>
        ) : (
          <button className="add-more-button" type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
            <span className="add-icon"><Plus size={22} /></span>
            <span><strong>Add more photos</strong><small>or drop more HEIC / HEIF files here</small></span>
          </button>
        )}
      </div>

      {notice && (
        <div className="converter-notice" role="status">
          <CircleAlert size={17} /> <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button>
        </div>
      )}

      {files.length > 0 && (
        <div className="file-workspace">
          <div className="file-list-heading">
            <div><Files size={17} /><strong>Your photos</strong><span>{files.length}</span></div>
            <button type="button" onClick={clearFiles} disabled={busy}><Trash2 size={15} /> Clear all</button>
          </div>
          {progress.active && (
            <div className="conversion-progress" aria-live="polite">
              <div className="conversion-progress-label"><span>{progress.message}</span><strong>{progressPercent}%</strong></div>
              <div className="conversion-progress-track"><i style={{ width: `${progressPercent}%` }} /></div>
            </div>
          )}
          <div className="file-list" aria-live="polite">
            {files.map((item) => (
              <div className={`file-row status-${item.status}`} key={item.id}>
                <div className="file-preview">
                  {item.outputUrl ? <img src={item.outputUrl} alt={`Converted ${item.outputName || item.file.name}`} /> : <FileImage size={23} />}
                </div>
                <div className="file-details">
                  <strong title={item.outputName || item.file.name}>{item.outputName || item.file.name}</strong>
                  {item.status === "done" && item.outputBlob ? (
                    <span title={`${formatBytes(item.file.size)} original · ${formatBytes(item.outputBlob.size)} output`}>
                      <CheckCircle2 size={13} />
                      {item.width && item.height ? `${item.width} x ${item.height} · ` : ""}
                      {formatBytes(item.outputBlob.size)} · {formatDisplayName(format)}
                    </span>
                  ) : item.status === "converting" ? (
                    <span><LoaderCircle className="spin" size={13} /> Converting locally…</span>
                  ) : item.status === "error" ? (
                    <span className="error-text" title={item.error}>{item.error}</span>
                  ) : (
                    <span>{formatBytes(item.file.size)} · Ready to convert</span>
                  )}
                </div>
                <div className="file-actions">
                  {item.status === "done" && (
                    <button className="icon-button download-one" type="button" onClick={() => downloadFile(item)} aria-label={`Download ${item.outputName || item.file.name}`}>
                      <ArrowDownToLine size={18} />
                    </button>
                  )}
                  {item.status === "error" && (
                    <button className="icon-button" type="button" onClick={() => void convertItems([item])} disabled={busy} aria-label={`Retry ${item.file.name}`}><RefreshCw size={17} /></button>
                  )}
                  <button className="icon-button remove-file" type="button" onClick={() => removeFile(item.id)} disabled={busy} aria-label={`Remove ${item.outputName || item.file.name}`}><X size={17} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="converter-actions">
            {!allDone && (
              <button className="button button-primary convert-button" type="button" onClick={convertAll} disabled={!pendingCount || busy}>
                {busy ? <LoaderCircle className="spin" size={19} /> : <RefreshCw size={18} />}
                {busy
                  ? `Converting on your device… ${progressPercent}%`
                  : doneCount > 0
                    ? `Convert remaining ${pendingCount} photo${pendingCount === 1 ? "" : "s"}`
                    : `Convert ${pendingCount || files.length} photo${(pendingCount || files.length) === 1 ? "" : "s"} to ${formatDisplayName(format)}`}
              </button>
            )}
            {doneCount > 0 && (
              <button className={`button download-zip-button ${allDone ? "button-primary convert-button" : "button-secondary"}`} type="button" onClick={downloadZip} disabled={zipping || busy}>
                {zipping ? <LoaderCircle className="spin" size={19} /> : <ArrowDownToLine size={19} />}
                {zipping ? "Preparing ZIP…" : "Download ZIP"}
              </button>
            )}
          </div>
          <p className="conversion-footnote"><LockKeyhole size={13} /> Conversion happens in this browser. Large files depend on your device's memory.</p>
        </div>
      )}
    </section>
  );
}
