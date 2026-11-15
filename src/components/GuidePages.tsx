import type { ReactNode } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  FileImage,
  FolderOpen,
  Image as ImageIcon,
  Laptop,
  LockKeyhole,
  Monitor,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDisplayName } from "../lib/formats";
import type { OutputFormat } from "../lib/formats";
import Seo from "./Seo";
import FaqList from "./FaqList";

interface GuideLayoutProps {
  eyebrow: string;
  title: string;
  intro: string;
  current: string;
  children: ReactNode;
}

function GuideLayout({ eyebrow, title, intro, current, children }: GuideLayoutProps) {
  return (
    <>
      <section className="guide-hero">
        <div className="content-width">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Converter</Link><ChevronRight size={14} /><span>{current}</span></nav>
          <span className="hero-eyebrow"><span className="eyebrow-dot" />{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </section>
      <div className="guide-layout content-width">
        <article className="guide-article">{children}</article>
        <aside className="guide-sidebar">
          <div className="sidebar-converter-card">
            <span className="sidebar-icon"><LockKeyhole size={22} /></span>
            <h3>Convert without uploading</h3>
            <p>Turn HEIC photos into JPG, PNG, or WebP directly in your browser.</p>
            <Link className="button button-primary" to="/">Open converter <ArrowRight size={17} /></Link>
            <span className="sidebar-fine-print"><ShieldCheck size={13} /> Free · Private · No sign-up</span>
          </div>
          <div className="sidebar-note">
            <strong>A quick privacy note</strong>
            <p>Your photos are processed on your own device. They are never sent to a conversion server.</p>
          </div>
        </aside>
      </div>
    </>
  );
}

function GuideCta({ format = "jpg" }: { format?: OutputFormat }) {
  const route = format === "webp" ? "/heic-to-webp" : format === "png" ? "/heic-to-png" : "/";
  return (
    <div className="inline-guide-cta">
      <div><span className="section-kicker">READY WHEN YOU ARE</span><h3>Make your photos work anywhere.</h3><p>Batch convert to {formatDisplayName(format)} without creating an account.</p></div>
      <Link className="button button-light" to={route}>Convert photos <ArrowRight size={17} /></Link>
    </div>
  );
}

const relatedLinks = [
  { to: "/how-to-convert-heic-on-mac", title: "Convert HEIC on Mac", text: "Three reliable ways to convert HEIC photos on macOS.", icon: Monitor },
  { to: "/iphone-heic-to-jpg", title: "iPhone HEIC to JPG", text: "Understand iPhone photo settings and convert existing photos.", icon: Smartphone },
  { to: "/heic-vs-jpg", title: "HEIC vs JPG", text: "A practical comparison of size, quality, and compatibility.", icon: FileImage },
  { to: "/how-to-open-heic-on-windows", title: "Open HEIC on Windows", text: "Open an iPhone photo on a Windows PC, step by step.", icon: Laptop },
];

export function RelatedReading({ exclude, limit = 3 }: { exclude: string; limit?: number }) {
  const visibleLinks = relatedLinks.filter((item) => item.to !== exclude).slice(0, limit);
  return (
    <section className="related-section content-width">
      <div className="section-heading"><span className="section-kicker">KEEP EXPLORING</span><h2>Helpful photo guides</h2></div>
      <div className="related-grid">
        {visibleLinks.map((item) => {
          const Icon = item.icon;
          return <Link to={item.to} className="related-card" key={item.to}><span><Icon size={22} /></span><h3>{item.title}</h3><p>{item.text}</p><strong>Read guide <ArrowRight size={15} /></strong></Link>;
        })}
      </div>
    </section>
  );
}

export function IphoneGuide() {
  return (
    <>
      <Seo title="iPhone HEIC to JPG — Convert Photos" description="Learn why your iPhone uses HEIC, how to save new photos as JPG, and how to convert existing HEIC photos privately in your browser." />
      <GuideLayout eyebrow="IPHONE PHOTO GUIDE" title="iPhone HEIC to JPG" intro="Your iPhone photos work beautifully on Apple devices. Here’s how to make them just as easy to use on Windows, websites, and in documents." current="iPhone HEIC to JPG">
        <section id="why-heic">
          <span className="article-number">01</span>
          <h2>Why does my iPhone save photos as HEIC?</h2>
          <p>HEIC is Apple’s container for photos encoded with High Efficiency Image Coding. It lets your iPhone store detailed photos using less space than a typical JPG, leaving more room for the moments you want to keep.</p>
          <p>The trade-off is compatibility. Some Windows apps, older software, and website upload forms still expect a JPG or PNG file.</p>
          <div className="article-callout"><Camera size={22} /><div><strong>HEIC is a storage choice, not a photo problem.</strong><p>Your original photo is still there. Converting simply creates a more compatible copy.</p></div></div>
        </section>
        <section id="convert-existing">
          <span className="article-number">02</span>
          <h2>Convert the photos you already have</h2>
          <div className="article-steps">
            <div><span>1</span><div><h3>Add your HEIC photos</h3><p>Select one photo or a whole batch. On your phone, choose files from your photo library or Files app.</p></div></div>
            <div><span>2</span><div><h3>Choose JPG and set quality</h3><p>90% is a useful starting point for everyday sharing. Move the slider higher when detail matters more than file size.</p></div></div>
            <div><span>3</span><div><h3>Download your copies</h3><p>Save photos individually or download the entire batch as one ZIP file. Conversion stays on your device.</p></div></div>
          </div>
        </section>
        <section id="future-photos">
          <span className="article-number">03</span>
          <h2>Save new iPhone photos as JPG</h2>
          <p>If you would rather not convert future photos, change your camera format. iOS will then save new still photos in JPEG instead of HEIC.</p>
          <div className="settings-path"><Settings size={23} /><span>Settings</span><ChevronRight size={16} /><span>Camera</span><ChevronRight size={16} /><span>Formats</span><ChevronRight size={16} /><strong>Most Compatible</strong></div>
          <ul className="article-checklist">
            <li><Check size={17} />This changes new photos, not photos already in your library.</li>
            <li><Check size={17} />JPG photos may use more storage than their HEIC equivalents.</li>
            <li><Check size={17} />You can switch back by choosing <strong>High Efficiency</strong>.</li>
          </ul>
        </section>
        <GuideCta />
      </GuideLayout>
      <FaqList title="iPhone photo questions" items={[
        { question: "Will changing Camera Formats convert my old photos?", answer: "No. The Most Compatible setting only affects photos you take after changing it. Use the converter for HEIC photos already in your library." },
        { question: "Does converting to JPG delete the original?", answer: "No. The converter creates a new JPG copy in your browser. Your original HEIC file remains untouched on your device." },
        { question: "Can I convert directly on my iPhone?", answer: "Yes. This tool works in a modern mobile browser. Available memory varies by device, so smaller batches are sensible for very large photo libraries." },
      ]} />
      <RelatedReading exclude="/iphone-heic-to-jpg" />
    </>
  );
}

export function ComparisonGuide() {
  return (
    <>
      <Seo title="HEIC vs JPG — What's the Difference?" description="Compare HEIC and JPG file size, image quality, compatibility, and everyday uses, then convert HEIC photos to JPG, PNG, or WebP locally." />
      <GuideLayout eyebrow="FORMAT FIELD GUIDE" title="HEIC vs JPG" intro="Both formats can hold a beautiful photo. The real difference is how they balance storage, compatibility, and the way you want to use it." current="HEIC vs JPG">
        <section id="quick-comparison">
          <span className="article-number">01</span>
          <h2>The practical difference</h2>
          <p>HEIC is efficient and modern. JPG is familiar and almost universally accepted. Choosing between them usually comes down to where the photo needs to go next.</p>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead><tr><th>What matters</th><th>HEIC</th><th>JPG</th></tr></thead>
              <tbody>
                <tr><th>Typical file size</th><td><strong>Smaller</strong> at similar visual quality</td><td>Usually larger</td></tr>
                <tr><th>Compression</th><td>Efficient, lossy or lossless</td><td>Lossy</td></tr>
                <tr><th>Compatibility</th><td>Best on newer devices</td><td><strong>Very broad</strong></td></tr>
                <tr><th>Everyday editing</th><td>May require support</td><td>Works in most apps</td></tr>
                <tr><th>Best suited to</th><td>Saving device storage</td><td>Sharing and uploading</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="quality-size">
          <span className="article-number">02</span>
          <h2>Which looks better?</h2>
          <p>There isn’t a universal winner. A high-quality JPG can look excellent, and a heavily compressed HEIC can lose detail. In everyday photos, HEIC often achieves comparable visual quality in less space.</p>
          <p>When converting to JPG, the quality setting controls the new JPEG compression. It cannot add detail back into a photo, but a higher setting helps avoid introducing additional visible artifacts.</p>
          <div className="format-fact-grid"><div><ImageIcon size={22} /><h3>Choose HEIC</h3><p>When your devices support it and storage space matters.</p></div><div><FolderOpen size={22} /><h3>Choose JPG</h3><p>When an app, website, or recipient expects broad compatibility.</p></div></div>
        </section>
        <section id="conversion">
          <span className="article-number">03</span>
          <h2>Choosing between JPG, PNG, and WebP</h2>
          <p>JPG is usually the practical choice for photographs because it creates smaller files and opens almost everywhere. PNG is useful when you need lossless output or a pixel-perfect copy for editing, but photo files are often much larger.</p>
          <p>WebP is a modern option for websites and apps that need efficient image delivery. You can choose JPG, PNG, or WebP in the converter; AVIF, BMP, and other formats are not included.</p>
        </section>
        <GuideCta />
      </GuideLayout>
      <FaqList title="HEIC and JPG questions" items={[
        { question: "Is HEIC better quality than JPG?", answer: "Not automatically. HEIC can deliver similar visual quality at a smaller file size, but the original capture and compression settings matter for both formats." },
        { question: "Does converting HEIC to JPG improve compatibility?", answer: "Yes. JPG is supported by most operating systems, browsers, editing tools, and upload forms, which makes it a reliable choice for sharing." },
        { question: "Will JPG make my photo smaller?", answer: "Not necessarily. A converted JPG can be larger than the original HEIC because HEIC generally compresses photographic images more efficiently." },
      ]} />
      <RelatedReading exclude="/heic-vs-jpg" />
    </>
  );
}

export function WindowsGuide() {
  return (
    <>
      <Seo title="How to Open HEIC on Windows" description="Open iPhone HEIC photos on Windows with HEIF support, or convert them to JPG, PNG, or WebP locally without uploading your photos." />
      <GuideLayout eyebrow="WINDOWS PHOTO GUIDE" title="How to Open HEIC on Windows" intro="An iPhone photo should not become a dead end on your PC. Try Windows’ built-in support first, or make a compatible copy in a few clicks." current="Open HEIC on Windows">
        <section id="photos-app">
          <span className="article-number">01</span>
          <h2>Open the file in the Photos app</h2>
          <p>Start with the simplest option. Double-click your HEIC file, or right-click it and choose <strong>Open with → Photos</strong>. On many up-to-date Windows 10 and Windows 11 PCs, the required support is already available.</p>
          <div className="article-steps">
            <div><span>1</span><div><h3>Locate your photo</h3><p>Find the .heic file in File Explorer. If you just copied it from an iPhone, check the DCIM folder or your import folder.</p></div></div>
            <div><span>2</span><div><h3>Open with Photos</h3><p>Right-click the file, select Open with, and choose Photos. If Windows asks to install HEIF support, follow the next section.</p></div></div>
          </div>
        </section>
        <section id="extensions">
          <span className="article-number">02</span>
          <h2>Add HEIF support if Windows asks</h2>
          <p>Microsoft’s <strong>HEIF Image Extensions</strong> add HEIC decoding support to compatible Windows apps. Open the Microsoft Store, search for that exact name, and install it from Microsoft.</p>
          <div className="article-callout"><Laptop size={22} /><div><strong>Some PCs may also need HEVC Video Extensions.</strong><p>This depends on the photo encoding and Windows setup. If Photos still cannot open the file after installing HEIF support, check for that Microsoft extension too.</p></div></div>
          <ul className="article-checklist"><li><Check size={17} />Restart the Photos app after installing an extension.</li><li><Check size={17} />Keep Windows updated for the best codec support.</li><li><Check size={17} />Download extensions only from the official Microsoft Store.</li></ul>
        </section>
        <section id="convert-instead">
          <span className="article-number">03</span>
          <h2>Or convert it without installing anything</h2>
          <p>If you only need to share, print, or upload a photo, converting can be simpler than adding system codecs. This converter uses your browser to make a JPG, PNG, or WebP copy on your PC.</p>
          <p>There is no server upload and no account. Add a batch, select your format, then download the converted files individually or as a ZIP.</p>
        </section>
        <GuideCta />
      </GuideLayout>
      <FaqList title="Windows HEIC questions" items={[
        { question: "Why can my iPhone open HEIC but Windows cannot?", answer: "Apple includes HEIC support in its operating systems. Windows support depends on the installed HEIF and, in some cases, HEVC codecs." },
        { question: "Do I always need to install a Windows extension?", answer: "No. Some PCs already have the required support. And if you only need a compatible copy, you can use this browser-based converter instead." },
        { question: "Is it safe to convert HEIC photos in a browser?", answer: "This tool processes files locally in your browser rather than sending them to a conversion server. Closing the tab clears the current workspace." },
      ]} />
      <RelatedReading exclude="/how-to-open-heic-on-windows" />
    </>
  );
}

export function MacGuide() {
  return (
    <>
      <Seo title="How to Convert HEIC on Mac" description="Convert HEIC photos on Mac with a private browser converter, Preview, or Finder Quick Actions. Includes batch steps and format advice." />
      <GuideLayout eyebrow="MAC PHOTO GUIDE" title="How to Convert HEIC on Mac" intro="macOS opens HEIC photos natively. When you need to share with another platform or prepare images for the web, these three methods cover everything from one photo to a full batch." current="Convert HEIC on Mac">
        <section id="browser-method">
          <span className="article-number">01</span>
          <h2>Use a private browser converter</h2>
          <p>This is the fastest option when you want a batch of JPG, PNG, or WebP files without installing anything. The conversion runs locally in your browser, so your photos never leave your Mac.</p>
          <div className="article-steps">
            <div><span>1</span><div><h3>Open the converter</h3><p>Use Safari, Chrome, Edge, or Firefox and open the heicconvert converter.</p></div></div>
            <div><span>2</span><div><h3>Drag files from Finder</h3><p>Drop one HEIC photo or a whole selection into the converter. HEIF files are accepted too.</p></div></div>
            <div><span>3</span><div><h3>Choose an output format</h3><p>Pick JPG, PNG, or WebP. Adjust quality for JPG and WebP; PNG uses lossless output.</p></div></div>
            <div><span>4</span><div><h3>Download the results</h3><p>Save each image individually or download the complete batch as a ZIP file.</p></div></div>
          </div>
          <div className="article-callout"><LockKeyhole size={22} /><div><strong>Best for quick, private batches.</strong><p>Your original HEIC files stay untouched, and you can keep the original resolution without changing system settings.</p></div></div>
        </section>
        <section id="preview-method">
          <span className="article-number">02</span>
          <h2>Use Preview, already built into macOS</h2>
          <p>Preview can export a single HEIC photo to a new format. It is a good choice when you only need one or two images and want to stay entirely offline.</p>
          <div className="article-steps">
            <div><span>1</span><div><h3>Open the HEIC file in Preview</h3><p>Double-click the photo, or right-click and choose Open With → Preview.</p></div></div>
            <div><span>2</span><div><h3>Choose File → Export</h3><p>Select the format you need from the Format menu.</p></div></div>
            <div><span>3</span><div><h3>Adjust and save</h3><p>For JPG or WebP, use the quality control if available. Choose a destination and click Save.</p></div></div>
          </div>
          <p>For multiple photos, select them all in Finder, open them together in Preview, then use <strong>File → Export Selected Images</strong>.</p>
        </section>
        <section id="quick-actions">
          <span className="article-number">03</span>
          <h2>Use Finder Quick Actions</h2>
          <p>On macOS Monterey or later, Finder can convert a batch without opening another app. This is convenient when you want to change image size at the same time.</p>
          <div className="article-steps">
            <div><span>1</span><div><h3>Select HEIC photos in Finder</h3><p>Choose one file or a whole group in the same folder.</p></div></div>
            <div><span>2</span><div><h3>Open Quick Actions</h3><p>Right-click the selection and choose Quick Actions → Convert Image.</p></div></div>
            <div><span>3</span><div><h3>Pick format and size</h3><p>Choose your output format and an image size such as Actual Size, Small, Medium, or Large.</p></div></div>
            <div><span>4</span><div><h3>Convert</h3><p>Run the action. Finder writes the converted copies alongside the originals.</p></div></div>
          </div>
        </section>
        <section id="which-method">
          <span className="article-number">04</span>
          <h2>Which method should you choose?</h2>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead><tr><th>Method</th><th>Best for</th><th>Batch + ZIP</th><th>Output formats</th></tr></thead>
              <tbody>
                <tr><th>Browser converter</th><td>Quick, private batches</td><td><strong>Yes</strong></td><td>JPG · PNG · WebP</td></tr>
                <tr><th>Preview</th><td>A single offline export</td><td>Manual</td><td>Common image formats</td></tr>
                <tr><th>Finder Quick Actions</th><td>Offline batches and resizing</td><td>Yes, no ZIP</td><td>Depends on macOS</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <GuideCta />
      </GuideLayout>
      <FaqList title="Mac HEIC questions" items={[
        { question: "Can Mac open HEIC files?", answer: "Yes. Preview, Photos, and Finder can display HEIC files natively on current versions of macOS. Conversion is mainly needed for sharing, web use, or compatibility with other software." },
        { question: "How do I batch convert HEIC photos on Mac?", answer: "Use Finder Quick Actions on macOS Monterey or later, or drag a whole batch into the browser converter and download the results as a ZIP." },
        { question: "Does converting to PNG lose quality?", answer: "PNG output is lossless from the decoded image. JPG and WebP use adjustable compression, so keep the original HEIC as your archival copy." },
        { question: "Do I need to install software on my Mac?", answer: "No. Preview and Finder are built into macOS, and the heicconvert converter works entirely in a modern browser." },
      ]} />
      <RelatedReading exclude="/how-to-convert-heic-on-mac" />
    </>
  );
}
