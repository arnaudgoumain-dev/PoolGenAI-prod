// Mini-shim Lucide : reproduit l'API des icônes utilisées par PoolApp
// (props: size, color, strokeWidth, style, className) sans dépendre d'un CDN tiers.
// Tracés simplifiés mais visuellement fidèles aux icônes Lucide d'origine.
(function () {
  const e = React.createElement;

  function Icon(paths, viewBox) {
    return function LucideIcon({ size = 24, color = "currentColor", strokeWidth = 2, style, className }) {
      return e(
        "svg",
        {
          width: size,
          height: size,
          viewBox: viewBox || "0 0 24 24",
          fill: "none",
          stroke: color,
          strokeWidth: strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          style: style,
          className: className,
        },
        paths.map((p, i) => e(p.tag, { key: i, ...p.attrs }))
      );
    };
  }

  const path = (d) => ({ tag: "path", attrs: { d } });
  const circle = (cx, cy, r) => ({ tag: "circle", attrs: { cx, cy, r } });
  const line = (x1, y1, x2, y2) => ({ tag: "line", attrs: { x1, y1, x2, y2 } });
  const rect = (x, y, w, h, rx) => ({ tag: "rect", attrs: { x, y, width: w, height: h, rx: rx || 0 } });
  const polyline = (points) => ({ tag: "polyline", attrs: { points } });

  window.LucideReact = {
    Plus: Icon([line(12, 5, 12, 19), line(5, 12, 19, 12)]),
    Trash2: Icon([
      path("M3 6h18"),
      path("M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"),
      path("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"),
      line(10, 11, 10, 17),
      line(14, 11, 14, 17),
    ]),
    Droplets: Icon([
      path("M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"),
      path("M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"),
    ]),
    X: Icon([line(18, 6, 6, 18), line(6, 6, 18, 18)]),
    ChevronRight: Icon([polyline("9 18 15 12 9 6")]),
    ChevronDown: Icon([polyline("6 9 12 15 18 9")]),
    Settings2: Icon([
      line(7, 21, 7, 14),
      line(7, 9, 7, 3),
      line(13, 21, 13, 12),
      line(13, 7, 13, 3),
      line(19, 21, 19, 16),
      line(19, 11, 19, 3),
      line(3, 14, 9, 14),
      line(10, 7, 16, 7),
      line(16, 16, 22, 16),
    ]),
    AlertTriangle: Icon([
      path("M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"),
      line(12, 9, 12, 13),
      line(12, 17, 12.01, 17),
    ]),
    CheckCircle2: Icon([
      path("M22 11.08V12a10 10 0 1 1-5.93-9.14"),
      polyline("22 4 12 14.01 9 11.01"),
    ]),
    History: Icon([
      path("M3 3v5h5"),
      path("M3.05 13A9 9 0 1 0 6 5.3L3 8"),
      polyline("12 7 12 12 16 14"),
    ]),
    Beaker: Icon([
      path("M4.5 3h15"),
      path("M6 3v7l-4 9a1 1 0 0 0 1 1.4h18a1 1 0 0 0 1-1.4l-4-9V3"),
      line(6.5, 14.5, 17.5, 14.5),
    ]),
    Camera: Icon([
      path("M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"),
      circle(12, 13, 4),
    ]),
    Lock: Icon([
      rect(3, 11, 18, 11, 2),
      path("M7 11V7a5 5 0 0 1 10 0v4"),
    ]),
    Crown: Icon([
      path("m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"),
      line(5, 20, 19, 20),
    ]),
    ImageOff: Icon([
      line(2, 2, 22, 22),
      path("M10.41 10.41a2 2 0 1 1-2.83-2.83"),
      path("M13.5 13.5 22 22"),
      path("M21 15V5a2 2 0 0 0-2-2H9"),
      path("M3.59 3.59A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.41-.59"),
    ]),
    Sparkles: Icon([
      path("m12 3-1.9 4.8a2 2 0 0 1-1.3 1.3L4 11l4.8 1.9a2 2 0 0 1 1.3 1.3L12 19l1.9-4.8a2 2 0 0 1 1.3-1.3L20 11l-4.8-1.9a2 2 0 0 1-1.3-1.3z"),
    ]),
    Loader2: Icon([path("M21 12a9 9 0 1 1-6.219-8.56")]),
    Clock: Icon([circle(12, 12, 10), polyline("12 6 12 12 16 14")]),
    FileText: Icon([
      path("M14.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5L14.5 4z"),
      path("M14 4v5h5"),
      line(8, 13, 16, 13),
      line(8, 17, 16, 17),
      line(8, 9, 10, 9),
    ]),
    Download: Icon([
      path("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"),
      polyline("7 10 12 15 17 10"),
      line(12, 15, 12, 3),
    ]),
    Eye: Icon([
      path("M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"),
      circle(12, 12, 3),
    ]),
    EyeOff: Icon([
      path("M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"),
      path("M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"),
      path("M1 1l22 22"),
    ]),
    Share2: Icon([
      circle(18, 5, 3),
      circle(6, 12, 3),
      circle(18, 19, 3),
      line(8.59, 13.51, 15.42, 17.49),
      line(15.41, 6.51, 8.59, 10.49),
    ]),
  };
})();
