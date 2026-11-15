import { useEffect } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileArchive,
  Files,
  Image as ImageIcon,
  LockKeyhole,
  MousePointer2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Converter from "./components/Converter";
import { formatDisplayName } from "./lib/formats";
import type { OutputFormat } from "./lib/formats";
import SiteLayout from "./components/SiteLayout";
import Seo from "./components/Seo";
import FaqList from "./components/FaqList";
import { ComparisonGuide, IphoneGuide, MacGuide, RelatedReading, WindowsGuide } from "./components/GuidePages";

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function TrustStrip() {
  return (
    <div className="trust-strip content-width" aria-label="Converter benefits">
      <div><span><LockKeyhole size={18} /></span><p><strong>Nothing gets uploaded</strong><small>Your photos stay on your device</small></p></div>
      <div><span><Files size={18} /></span><p><strong>Built for batches</strong><small>Convert and download a ZIP</small></p></div>
      <div><span><CheckCircle2 size={18} /></span><p><strong>Free, without the fuss</strong><small>No account or watermark</small></p></div>
    </div>
  );
}

function AdSlot() {
  return <aside className="ad-slot content-width" aria-label="Advertisement placeholder"><span>ADVERTISEMENT</span><p>A reserved, unobtrusive space. Your converter always comes first.</p></aside>;
}

function HowItWorks({ format }: { format: OutputFormat }) {
  return (
    <section className="how-section content-width">
      <div className="section-heading centered-heading">
        <span className="section-kicker">FROM HEIC TO READY</span>
        <h2>Three steps. That’s the whole thing.</h2>
        <p>No setup, no email address, and no waiting for an upload to finish.</p>
      </div>
      <div className="steps-grid">
        <div className="step-card"><span className="step-number">01</span><div className="step-icon"><MousePointer2 size={25} /></div><h3>Add your photos</h3><p>Drop in one HEIC photo or select a whole batch from your phone or computer.</p></div>
        <div className="step-card featured-step"><span className="step-number">02</span><div className="step-icon"><SlidersHorizontal size={25} /></div><h3>Make it yours</h3><p>Choose JPG, PNG, or WebP. For JPG and WebP, adjust the quality slider; 90% is a great place to start.</p></div>
        <div className="step-card"><span className="step-number">03</span><div className="step-icon"><FileArchive size={25} /></div><h3>Save your files</h3><p>Download each {formatDisplayName(format)} photo, or keep the batch together in one tidy ZIP.</p></div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="privacy-section content-width">
      <div className="privacy-copy">
        <span className="section-kicker light-kicker">PRIVATE BY DESIGN, NOT BY PROMISE</span>
        <h2>Your photos don’t need<br />to leave home.</h2>
        <p>Conversion happens inside your browser using local processing. There is no upload queue, no cloud folder, and no account attached to your photos.</p>
        <Link to="/how-to-convert-heic-on-mac">Using a Mac? Read the conversion guide <ArrowRight size={16} /></Link>
      </div>
      <div className="privacy-panel">
        <div className="privacy-panel-top"><span className="privacy-shield"><ShieldCheck size={28} /></span><span className="privacy-status"><i /> LOCAL WORKSPACE</span></div>
        <div className="privacy-row"><span><ImageIcon size={18} /> Your original photos</span><strong>On your device <Check size={16} /></strong></div>
        <div className="privacy-row"><span><SlidersHorizontal size={18} /> Conversion process</span><strong>In your browser <Check size={16} /></strong></div>
        <div className="privacy-row"><span><FileArchive size={18} /> Converted files</span><strong>Downloaded by you <Check size={16} /></strong></div>
        <p><LockKeyhole size={14} /> Closing the tab clears the current workspace.</p>
      </div>
    </section>
  );
}

const homeFaqs = [
  { question: "Are my photos uploaded to a server?", answer: "No. Your HEIC photos are decoded and converted locally in your browser. The tool does not send your photos to a conversion server, and closing the tab clears the current workspace." },
  { question: "Can I convert more than one photo at a time?", answer: "Yes. Add a batch of HEIC or HEIF files. They convert automatically one by one, and you can download the finished photos as a ZIP. Very large batches depend on the memory available on your device." },
  { question: "Do I need to register or pay?", answer: "No. The converter is free to use, with no registration and no watermark. There is no fixed file-count limit; practical limits come from your browser and available device memory." },
  { question: "Which output formats are available?", answer: "JPG, PNG, and WebP are available. JPG and WebP support adjustable quality from 10% to 100%. PNG uses lossless output and often creates larger photo files." },
  { question: "Can a HEIC file contain more than one image?", answer: "Yes. Some HEIC containers hold an image sequence. When multiple images are found, each one is exported as a separate converted file with a numbered suffix." },
  { question: "Does the converter keep all photo metadata?", answer: "No complete metadata preservation is promised. The converter focuses on creating compatible image copies. Keep your original HEIC file if you need the original metadata." },
];

const pngFaqs = [
  { question: "Should I choose PNG, JPG, or WebP?", answer: "Choose JPG for broad sharing compatibility, PNG for lossless output and editing, or WebP for smaller web-friendly images. JPG and WebP support adjustable quality; PNG does not." },
  { question: "Will PNG keep a transparent background?", answer: "PNG can store transparency, but converting a standard HEIC photo does not create transparency that was not present in the source. A normal iPhone photo will still have its original background." },
  { question: "Why is my PNG larger than the original HEIC?", answer: "HEIC is designed for efficient photographic compression. PNG uses lossless compression and often produces substantially larger files for everyday photos." },
  { question: "Are PNG conversions uploaded?", answer: "No. JPG, PNG, and WebP conversions all run locally in your browser. Your source photos and converted images are not sent to a conversion server." },
];

const webpFaqs = [
  { question: "What is WebP best for?", answer: "WebP is a modern image format designed for efficient web delivery. It often creates smaller files than JPG at comparable visual quality, while current browsers and many apps support it." },
  { question: "Can I adjust WebP quality?", answer: "Yes. The quality slider applies to WebP and JPG from 10% to 100%. Higher settings preserve more detail but usually create larger files." },
  { question: "What if my browser cannot create WebP?", answer: "The converter checks browser support and shows a clear message instead of silently producing the wrong format. A current version of Chrome, Edge, Firefox, or Safari supports WebP output." },
  { question: "Are WebP conversions private?", answer: "Yes. Like JPG and PNG, WebP conversion happens locally in your browser. Your HEIC photos are never sent to a conversion server." },
];

const toolPageMeta: Record<OutputFormat, { title: string; description: string; faqTitle: string }> = {
  jpg: {
    title: "HEIC to JPG — Free, Batch, No Upload",
    description: "Convert HEIC to JPG, PNG, or WebP locally in your browser. Batch conversion, quality control, ZIP downloads, no upload, and no sign-up.",
    faqTitle: "Questions, answered.",
  },
  png: {
    title: "HEIC to PNG — Free Online Converter",
    description: "Convert HEIC to PNG locally in your browser. Batch conversion, ZIP download, no upload, no registration, and no watermark.",
    faqTitle: "About PNG conversion",
  },
  webp: {
    title: "HEIC to WebP — Free Online Converter",
    description: "Convert HEIC to WebP locally in your browser with adjustable quality, batch conversion, ZIP download, and no upload.",
    faqTitle: "About WebP conversion",
  },
};

function ToolPage({ format }: { format: OutputFormat }) {
  const meta = toolPageMeta[format];
  const faqs = format === "png" ? pngFaqs : format === "webp" ? webpFaqs : homeFaqs;
  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <section className="tool-hero">
        <div className="hero-decoration hero-decoration-left" aria-hidden="true" />
        <div className="hero-decoration hero-decoration-right" aria-hidden="true" />
        <div className="content-width hero-content">
          <span className="hero-eyebrow"><span className="eyebrow-dot" />FREE · PRIVATE · BROWSER-BASED</span>
          <h1>HEIC to <span className="hero-highlight">{formatDisplayName(format)}</span> Converter</h1>
          <p>Make your iPhone photos compatible with everything.<br className="desktop-break" /> Fast, batch-ready conversion—with none of the uploading.</p>
          <div className="hero-proof"><span><Check size={14} /> No sign-up</span><span><Check size={14} /> No watermark</span><span><Check size={14} /> JPG · PNG · WebP</span></div>
        </div>
      </section>
      <div className="converter-wrap content-width"><Converter key={format} initialFormat={format} /></div>
      <TrustStrip />
      <AdSlot />
      <HowItWorks format={format} />
      <PrivacySection />
      <FaqList items={faqs} title={meta.faqTitle} />
      <RelatedReading exclude="" />
    </>
  );
}

function AppRoutes() {
  return (
    <SiteLayout>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<ToolPage format="jpg" />} />
        <Route path="/heic-to-png" element={<ToolPage format="png" />} />
        <Route path="/heic-to-webp" element={<ToolPage format="webp" />} />
        <Route path="/iphone-heic-to-jpg" element={<IphoneGuide />} />
        <Route path="/heic-vs-jpg" element={<ComparisonGuide />} />
        <Route path="/how-to-open-heic-on-windows" element={<WindowsGuide />} />
        <Route path="/how-to-convert-heic-on-mac" element={<MacGuide />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SiteLayout>
  );
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
