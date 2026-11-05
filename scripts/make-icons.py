"""Rasterise the Ayoreni mark (design/assets/logo/ayoreni-mark.svg) into app icon PNGs.

Pure Pillow: the mark is two cubic-bezier strokes and a circle, so it is drawn
directly at 4x and downsampled. Usage, from myhealthapp/: python scripts/make-icons.py assets  (needs Pillow)
"""
import sys
from PIL import Image, ImageDraw

ASSETS = sys.argv[1]
SS = 4  # supersampling factor

BLUE, MID, TEAL = (0x0A, 0x5C, 0xE6), (0x0A, 0xA5, 0xF0), (0x00, 0xC9, 0xA7)

RIBBON = [  # cubic segments: (p0, c1, c2, p3) in the SVG's 120x86 space (y from 2)
    ((60, 56), (70, 44), (80, 36), (92, 36)),
    ((92, 36), (104, 36), (112, 45), (112, 56)),
    ((112, 56), (112, 67), (104, 76), (92, 76)),
    ((92, 76), (80, 76), (70, 68), (60, 56)),
    ((60, 56), (50, 44), (40, 36), (28, 36)),
    ((28, 36), (16, 36), (8, 45), (8, 56)),
    ((8, 56), (8, 67), (16, 76), (28, 76)),
    ((28, 76), (40, 76), (50, 68), (60, 56)),
]
OVER = [
    ((44.75, 70.5), (50, 67), (55, 62), (60, 56)),
    ((60, 56), (65, 50), (70, 45), (75.25, 41.5)),
]
HEAD = (88, 15, 8.5)
VB_X, VB_Y, VB_W, VB_H = 0, 2, 120, 86


def bez(seg, n=64):
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = seg
    pts = []
    for i in range(n + 1):
        t = i / n
        a, b, c, d = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3
        pts.append((a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3))
    return pts


def stroke(draw, segs, width, fill, tf, round_caps):
    pts = []
    for s in segs:
        pts.extend(bez(s))
    pts = [tf(p) for p in pts]
    w = width * tf.scale
    draw.line(pts, fill=fill, width=int(round(w)), joint='curve')
    r = w / 2
    # Dense discs smooth the joins; caps only where the path is meant to be round.
    body = pts[1:-1] if not round_caps else pts
    for x, y in body[::2]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)


def mark_alpha(size_px, box_w):
    """8-bit coverage mask of the mark, centred in a size_px square, box_w wide."""
    S = size_px * SS
    scale = box_w * SS / VB_W
    ox = (S - VB_W * scale) / 2
    oy = (S - VB_H * scale) / 2

    def tf(p):
        return (ox + (p[0] - VB_X) * scale, oy + (p[1] - VB_Y) * scale)
    tf.scale = scale

    ribbon = Image.new('L', (S, S), 0)
    stroke(ImageDraw.Draw(ribbon), RIBBON, 13, 255, tf, round_caps=True)
    cut = Image.new('L', (S, S), 0)
    # Butt-ended band, like the SVG mask: no rounded discs at its ends.
    pts = [tf(p) for s in OVER for p in bez(s)]
    ImageDraw.Draw(cut).line(pts, fill=255, width=int(round(21 * scale)), joint='curve')
    ribbon.paste(0, (0, 0), cut)
    d = ImageDraw.Draw(ribbon)
    stroke(d, OVER, 13, 255, tf, round_caps=True)
    cx, cy, r = HEAD
    (hx, hy), hr = tf((cx, cy)), r * scale
    d.ellipse((hx - hr, hy - hr, hx + hr, hy + hr), fill=255)
    return ribbon.resize((size_px, size_px), Image.LANCZOS), tf


def gradient(size_px, stops, start, end):
    """Linear gradient between two points given as fractions of the square."""
    img = Image.new('RGB', (size_px, size_px))
    px = img.load()
    (sx, sy), (ex, ey) = start, end
    dx, dy = ex - sx, ey - sy
    L2 = dx * dx + dy * dy
    for y in range(size_px):
        fy = y / (size_px - 1)
        for x in range(size_px):
            fx = x / (size_px - 1)
            t = max(0.0, min(1.0, ((fx - sx) * dx + (fy - sy) * dy) / L2))
            for i in range(len(stops) - 1):
                (o0, c0), (o1, c1) = stops[i], stops[i + 1]
                if t <= o1:
                    k = (t - o0) / (o1 - o0)
                    px[x, y] = tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(3))
                    break
    return img


BG_STOPS = [(0, (0x0A, 0x6C, 0xF0)), (0.55, (0x06, 0xA3, 0xD9)), (1, TEAL)]
MARK_STOPS = [(0, BLUE), (0.5, MID), (1, TEAL)]


def white_on(bg, alpha):
    out = bg.convert('RGBA')
    out.paste((255, 255, 255, 255), (0, 0), alpha)
    return out


N = 1024
# iOS / store icon: full-bleed gradient (iOS rounds the corners), white mark.
bg = gradient(N, BG_STOPS, (0.1, 0.0), (0.9, 1.0))
a, _ = mark_alpha(N, 600)
white_on(bg, a).convert('RGB').save(f'{ASSETS}/icon.png')

# Android adaptive: gradient background layer, white mark in the 66% safe zone.
bg.save(f'{ASSETS}/adaptive-icon-background.png')
fg = Image.new('RGBA', (N, N), (0, 0, 0, 0))
a, _ = mark_alpha(N, 500)
fg.paste((255, 255, 255, 255), (0, 0), a)
fg.save(f'{ASSETS}/adaptive-icon.png')
# Android 13 themed icon uses the same silhouette.
fg.save(f'{ASSETS}/adaptive-icon-monochrome.png')

# Splash: brand-gradient mark on transparent, small in the frame so 'contain' keeps it modest.
a, _ = mark_alpha(N, 380)
sp = gradient(N, MARK_STOPS, (0.3, 0.62), (0.7, 0.38)).convert('RGBA')
sp.putalpha(a)
sp.save(f'{ASSETS}/splash.png')

# Android notification icon: white silhouette on transparent, 96 px.
a, _ = mark_alpha(96 * 4, 96 * 4 * 0.92)
ni = Image.new('RGBA', (384, 384), (0, 0, 0, 0))
ni.paste((255, 255, 255, 255), (0, 0), a)
ni.resize((96, 96), Image.LANCZOS).save(f'{ASSETS}/notification-icon.png')
print('ok')
