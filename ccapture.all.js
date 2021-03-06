"use strict";
!(function () {
  var t = "undefined" != typeof module && void 0 !== module.exports,
    e = function (t) {
      (this.data = new Uint8Array(t)), (this.pos = 0);
    };
  (e.prototype.seek = function (t) {
    this.pos = t;
  }),
    (e.prototype.writeBytes = function (t) {
      for (var e = 0; e < t.length; e++) this.data[this.pos++] = t[e];
    }),
    (e.prototype.writeU8 = e.prototype.writeByte =
      function (t) {
        this.data[this.pos++] = t;
      }),
    (e.prototype.writeU16BE = function (t) {
      (this.data[this.pos++] = t >> 8), (this.data[this.pos++] = t);
    }),
    (e.prototype.writeDoubleBE = function (t) {
      for (
        var e = new Uint8Array(new Float64Array([t]).buffer), i = e.length - 1;
        0 <= i;
        i--
      )
        this.writeByte(e[i]);
    }),
    (e.prototype.writeFloatBE = function (t) {
      for (
        var e = new Uint8Array(new Float32Array([t]).buffer), i = e.length - 1;
        0 <= i;
        i--
      )
        this.writeByte(e[i]);
    }),
    (e.prototype.writeString = function (t) {
      for (var e = 0; e < t.length; e++)
        this.data[this.pos++] = t.charCodeAt(e);
    }),
    (e.prototype.writeEBMLVarIntWidth = function (t, e) {
      switch (e) {
        case 1:
          this.writeU8(128 | t);
          break;
        case 2:
          this.writeU8(64 | (t >> 8)), this.writeU8(t);
          break;
        case 3:
          this.writeU8(32 | (t >> 16)), this.writeU8(t >> 8), this.writeU8(t);
          break;
        case 4:
          this.writeU8(16 | (t >> 24)),
            this.writeU8(t >> 16),
            this.writeU8(t >> 8),
            this.writeU8(t);
          break;
        case 5:
          this.writeU8(8 | ((t / 4294967296) & 7)),
            this.writeU8(t >> 24),
            this.writeU8(t >> 16),
            this.writeU8(t >> 8),
            this.writeU8(t);
          break;
        default:
          throw new RuntimeException("Bad EBML VINT size " + e);
      }
    }),
    (e.prototype.measureEBMLVarInt = function (t) {
      if (t < 127) return 1;
      if (t < 16383) return 2;
      if (t < 2097151) return 3;
      if (t < 268435455) return 4;
      if (t < 34359738367) return 5;
      throw new RuntimeException("EBML VINT size not supported " + t);
    }),
    (e.prototype.writeEBMLVarInt = function (t) {
      this.writeEBMLVarIntWidth(t, this.measureEBMLVarInt(t));
    }),
    (e.prototype.writeUnsignedIntBE = function (t, e) {
      switch ((void 0 === e && (e = this.measureUnsignedInt(t)), e)) {
        case 5:
          this.writeU8(Math.floor(t / 4294967296));
        case 4:
          this.writeU8(t >> 24);
        case 3:
          this.writeU8(t >> 16);
        case 2:
          this.writeU8(t >> 8);
        case 1:
          this.writeU8(t);
          break;
        default:
          throw new RuntimeException("Bad UINT size " + e);
      }
    }),
    (e.prototype.measureUnsignedInt = function (t) {
      return t < 256
        ? 1
        : t < 65536
        ? 2
        : t < 1 << 24
        ? 3
        : t < 4294967296
        ? 4
        : 5;
    }),
    (e.prototype.getAsDataArray = function () {
      if (this.pos < this.data.byteLength)
        return this.data.subarray(0, this.pos);
      if (this.pos == this.data.byteLength) return this.data;
      throw "ArrayBufferDataStream's pos lies beyond end of buffer";
    }),
    (window.ArrayBufferDataStream = e);
  var f,
    i =
      ((f = t ? require("fs") : null),
      function (t) {
        var n = [],
          e = Promise.resolve(),
          r = null,
          s = null;
        function o(n) {
          return new Promise(function (t, e) {
            var i = new FileReader();
            i.addEventListener("loadend", function () {
              t(i.result);
            }),
              i.readAsArrayBuffer(n);
          });
        }
        function h(i) {
          return new Promise(function (t, e) {
            i instanceof Uint8Array
              ? t(i)
              : i instanceof ArrayBuffer || ArrayBuffer.isView(i)
              ? t(new Uint8Array(i))
              : i instanceof Blob
              ? t(
                  o(i).then(function (t) {
                    return new Uint8Array(t);
                  })
                )
              : t(
                  o(new Blob([i])).then(function (t) {
                    return new Uint8Array(t);
                  })
                );
          });
        }
        "undefined" != typeof FileWriter && t instanceof FileWriter
          ? (r = t)
          : f && t && (s = t),
          (this.pos = 0),
          (this.length = 0),
          (this.seek = function (t) {
            if (t < 0) throw "Offset may not be negative";
            if (isNaN(t)) throw "Offset may not be NaN";
            if (t > this.length)
              throw "Seeking beyond the end of file is not allowed";
            this.pos = t;
          }),
          (this.write = function (t) {
            var a = {
                offset: this.pos,
                data: t,
                length: (function (t) {
                  var e = t.byteLength || t.length || t.size;
                  if (!Number.isInteger(e))
                    throw "Failed to determine size of element";
                  return e;
                })(t),
              },
              i = a.offset >= this.length;
            (this.pos += a.length),
              (this.length = Math.max(this.length, this.pos)),
              (e = e.then(function () {
                if (s)
                  return new Promise(function (o, t) {
                    h(a.data).then(function (t) {
                      var n = 0,
                        e = Buffer.from(t.buffer),
                        r = function (t, e, i) {
                          (n += e) >= i.length
                            ? o()
                            : f.write(s, i, n, i.length - n, a.offset + n, r);
                        };
                      f.write(s, e, 0, e.length, a.offset, r);
                    });
                  });
                if (r)
                  return new Promise(function (t, e) {
                    (r.onwriteend = t),
                      r.seek(a.offset),
                      r.write(new Blob([a.data]));
                  });
                if (!i)
                  for (var t = 0; t < n.length; t++) {
                    var e = n[t];
                    if (
                      !(
                        a.offset + a.length <= e.offset ||
                        a.offset >= e.offset + e.length
                      )
                    ) {
                      if (
                        a.offset < e.offset ||
                        a.offset + a.length > e.offset + e.length
                      )
                        throw new Error("Overwrite crosses blob boundaries");
                      return a.offset == e.offset && a.length == e.length
                        ? void (e.data = a.data)
                        : h(e.data)
                            .then(function (t) {
                              return (e.data = t), h(a.data);
                            })
                            .then(function (t) {
                              (a.data = t),
                                e.data.set(a.data, a.offset - e.offset);
                            });
                    }
                  }
                n.push(a);
              }));
          }),
          (this.complete = function (i) {
            return (e =
              s || r
                ? e.then(function () {
                    return null;
                  })
                : e.then(function () {
                    for (var t = [], e = 0; e < n.length; e++)
                      t.push(n[e].data);
                    return new Blob(t, { mimeType: i });
                  }));
          });
      });
  window.BlobBuffer = i;
  var n = function (x, t) {
    function E(t, e) {
      var i,
        n = t.toDataURL("image/webp", { quality: e });
      return (
        !(
          "string" != typeof (i = n) || !i.match(/^data:image\/webp;base64,/i)
        ) && window.atob(i.substring("data:image/webp;base64,".length))
      );
    }
    function B(t) {
      this.value = t;
    }
    function L(t, e, i) {
      if (Array.isArray(i)) for (var n = 0; n < i.length; n++) L(t, e, i[n]);
      else if ("string" == typeof i) t.writeString(i);
      else if (i instanceof Uint8Array) t.writeBytes(i);
      else {
        if (!i.id) throw "Bad EBML datatype " + typeof i.data;
        var r, o, a;
        if (
          ((i.offset = t.pos + e),
          t.writeUnsignedIntBE(i.id),
          Array.isArray(i.data))
        )
          -1 === i.size
            ? t.writeByte(255)
            : ((r = t.pos), t.writeBytes([0, 0, 0, 0])),
            (o = t.pos),
            (i.dataOffset = o + e),
            L(t, e, i.data),
            -1 !== i.size &&
              ((a = t.pos),
              (i.size = a - o),
              t.seek(r),
              t.writeEBMLVarIntWidth(i.size, 4),
              t.seek(a));
        else if ("string" == typeof i.data)
          t.writeEBMLVarInt(i.data.length),
            (i.dataOffset = t.pos + e),
            t.writeString(i.data);
        else if ("number" == typeof i.data)
          i.size || (i.size = t.measureUnsignedInt(i.data)),
            t.writeEBMLVarInt(i.size),
            (i.dataOffset = t.pos + e),
            t.writeUnsignedIntBE(i.data, i.size);
        else if (i.data instanceof B)
          t.writeEBMLVarInt(8),
            (i.dataOffset = t.pos + e),
            t.writeDoubleBE(i.data.value);
        else if (
          i.data instanceof
          function (t) {
            this.value = t;
          }
        )
          t.writeEBMLVarInt(4),
            (i.dataOffset = t.pos + e),
            t.writeFloatBE(i.data.value);
        else {
          if (!(i.data instanceof Uint8Array))
            throw "Bad EBML datatype " + typeof i.data;
          t.writeEBMLVarInt(i.data.byteLength),
            (i.dataOffset = t.pos + e),
            t.writeBytes(i.data);
        }
      }
    }
    return function (n) {
      var r,
        o,
        a,
        s,
        i,
        h = 5e3,
        f = 1,
        d = !1,
        u = [],
        l = 0,
        c = 0,
        p = {
          Cues: { id: new Uint8Array([28, 83, 187, 107]), positionEBML: null },
          SegmentInfo: {
            id: new Uint8Array([21, 73, 169, 102]),
            positionEBML: null,
          },
          Tracks: {
            id: new Uint8Array([22, 84, 174, 107]),
            positionEBML: null,
          },
        },
        m = { id: 17545, data: new B(0) },
        w = [],
        g = new t(n.fileWriter || n.fd);
      function y(t) {
        return t - a.dataOffset;
      }
      function v() {
        s = (function () {
          var t = { id: 21420, size: 5, data: 0 },
            e = { id: 290298740, data: [] };
          for (var i in p) {
            var n = p[i];
            (n.positionEBML = Object.create(t)),
              e.data.push({
                id: 19899,
                data: [{ id: 21419, data: n.id }, n.positionEBML],
              });
          }
          return e;
        })();
        var t = {
            id: 357149030,
            data: [
              { id: 2807729, data: 1e6 },
              { id: 19840, data: "webm-writer-js" },
              { id: 22337, data: "webm-writer-js" },
              m,
            ],
          },
          e = {
            id: 374648427,
            data: [
              {
                id: 174,
                data: [
                  { id: 215, data: f },
                  { id: 29637, data: f },
                  { id: 156, data: 0 },
                  { id: 2274716, data: "und" },
                  { id: 134, data: "V_VP8" },
                  { id: 2459272, data: "VP8" },
                  { id: 131, data: 1 },
                  {
                    id: 224,
                    data: [
                      { id: 176, data: r },
                      { id: 186, data: o },
                    ],
                  },
                ],
              },
            ],
          };
        a = { id: 408125543, size: -1, data: [s, t, e] };
        var i = new x(256);
        L(i, g.pos, [
          {
            id: 440786851,
            data: [
              { id: 17030, data: 1 },
              { id: 17143, data: 1 },
              { id: 17138, data: 4 },
              { id: 17139, data: 8 },
              { id: 17026, data: "webm" },
              { id: 17031, data: 2 },
              { id: 17029, data: 2 },
            ],
          },
          a,
        ]),
          g.write(i.getAsDataArray()),
          (p.SegmentInfo.positionEBML.data = y(t.offset)),
          (p.Tracks.positionEBML.data = y(e.offset));
      }
      function b(t) {
        var e = new x(4);
        if (!(0 < t.trackNumber && t.trackNumber < 127))
          throw "TrackNumber must be > 0 and < 127";
        return (
          e.writeEBMLVarInt(t.trackNumber),
          e.writeU16BE(t.timecode),
          e.writeByte(128),
          { id: 163, data: [e.getAsDataArray(), t.frame] }
        );
      }
      function k() {
        if (0 != u.length) {
          for (var t = 0, e = 0; e < u.length; e++) t += u[e].frame.length;
          var i,
            n,
            r,
            o,
            a = new x(t + 32 * u.length),
            s =
              ((i = { timecode: Math.round(l) }),
              {
                id: 524531317,
                data: [{ id: 231, data: Math.round(i.timecode) }],
              });
          for (e = 0; e < u.length; e++) s.data.push(b(u[e]));
          L(a, g.pos, s),
            g.write(a.getAsDataArray()),
            (n = f),
            (r = Math.round(l)),
            (o = s.offset),
            w.push({
              id: 187,
              data: [
                { id: 179, data: r },
                {
                  id: 183,
                  data: [
                    { id: 247, data: n },
                    { id: 241, data: y(o) },
                  ],
                },
              ],
            }),
            (u = []),
            (l += c),
            (c = 0);
        }
      }
      (this.addFrame = function (t) {
        if (d) {
          if (t.width != r || t.height != o)
            throw "Frame size differs from previous frames";
        } else (r = t.width), (o = t.height), v(), (d = !0);
        var e,
          i = E(t, { quality: n.quality });
        if (!i)
          throw "Couldn't decode WebP frame, does the browser support WebP?";
        ((e = {
          frame: (function (t) {
            var e = t.indexOf("VP8 ");
            if (-1 == e)
              throw "Failed to identify beginning of keyframe in WebP image";
            return (e += "VP8 ".length + 4), t.substring(e);
          })(i),
          duration: n.frameDuration,
        }).trackNumber = f),
          (e.timecode = Math.round(c)),
          u.push(e),
          (c += e.duration),
          h <= c && k();
      }),
        (this.complete = function () {
          var t, e, i, n, r, o;
          return (
            k(),
            (t = { id: 475249515, data: w }),
            L((e = new x(16 + 32 * w.length)), g.pos, t),
            g.write(e.getAsDataArray()),
            (p.Cues.positionEBML.data = y(t.offset)),
            (i = new x(s.size)),
            (n = g.pos),
            L(i, s.dataOffset, s.data),
            g.seek(s.dataOffset),
            g.write(i.getAsDataArray()),
            g.seek(n),
            (r = new x(8)),
            (o = g.pos),
            r.writeDoubleBE(l),
            g.seek(m.dataOffset),
            g.write(r.getAsDataArray()),
            g.seek(o),
            g.complete("video/webm")
          );
        }),
        (this.getWrittenSize = function () {
          return g.length;
        }),
        (i = {}),
        [
          {
            quality: 0.95,
            fileWriter: null,
            fd: null,
            frameDuration: null,
            frameRate: null,
          },
          n || {},
        ].forEach(function (t) {
          for (var e in t)
            Object.prototype.hasOwnProperty.call(t, e) && (i[e] = t[e]);
        }),
        (n = i),
        (function () {
          if (!n.frameDuration) {
            if (!n.frameRate)
              throw "Missing required frameDuration or frameRate setting";
            n.frameDuration = 1e3 / n.frameRate;
          }
        })();
    };
  };
  t ? (module.exports = n(e, i)) : (window.WebMWriter = n(e, i));
})(),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define([], e)
      : "object" == typeof exports
      ? (module.exports = e())
      : (t.download = e());
  })(this, function () {
    return function e(t, i, n) {
      var r,
        o,
        a = window,
        s = "application/octet-stream",
        h = n || s,
        f = t,
        d = !i && !n && f,
        u = document.createElement("a"),
        l = function (t) {
          return String(t);
        },
        c = a.Blob || a.MozBlob || a.WebKitBlob || l,
        p = i || "download";
      if (
        ((c = c.call ? c.bind(a) : Blob),
        "true" === String(this) && ((h = (f = [f, h])[0]), (f = f[1])),
        d &&
          d.length < 2048 &&
          ((p = d.split("/").pop().split("?")[0]),
          (u.href = d),
          -1 !== u.href.indexOf(d)))
      ) {
        var m = new XMLHttpRequest();
        return (
          m.open("GET", d, !0),
          (m.responseType = "blob"),
          (m.onload = function (t) {
            e(t.target.response, p, s);
          }),
          setTimeout(function () {
            m.send();
          }, 0),
          m
        );
      }
      if (/^data:([\w+-]+\/[\w+.-]+)?[,;]/.test(f)) {
        if (!(2096103.424 < f.length && c !== l))
          return navigator.msSaveBlob ? navigator.msSaveBlob(v(f), p) : b(f);
        h = (f = v(f)).type || s;
      } else if (/([\x80-\xff])/.test(f)) {
        for (var w = 0, g = new Uint8Array(f.length), y = g.length; w < y; ++w)
          g[w] = f.charCodeAt(w);
        f = new c([g], { type: h });
      }
      function v(t) {
        for (
          var e = t.split(/[:;,]/),
            i = e[1],
            n = (
              "base64" == e[0 < t.indexOf("charset") ? 3 : 2]
                ? atob
                : decodeURIComponent
            )(e.pop()),
            r = n.length,
            o = 0,
            a = new Uint8Array(r);
          o < r;
          ++o
        )
          a[o] = n.charCodeAt(o);
        return new c([a], { type: i });
      }
      function b(t, e) {
        if ("download" in u)
          return (
            (u.href = t),
            u.setAttribute("download", p),
            (u.className = "download-js-link"),
            (u.innerHTML = "downloading..."),
            (u.style.display = "none"),
            u.addEventListener("click", function (t) {
              t.stopPropagation(),
                this.removeEventListener("click", arguments.callee);
            }),
            document.body.appendChild(u),
            setTimeout(function () {
              u.click(),
                document.body.removeChild(u),
                !0 === e &&
                  setTimeout(function () {
                    a.URL.revokeObjectURL(u.href);
                  }, 250);
            }, 66),
            !0
          );
        if (
          /(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(
            navigator.userAgent
          )
        )
          return (
            /^data:/.test(t) &&
              (t = "data:" + t.replace(/^data:([\w\/\-\+]+)/, s)),
            window.open(t) ||
              (confirm(
                "Displaying New Document\n\nUse Save As... to download, then click back to return to this page."
              ) &&
                (location.href = t)),
            !0
          );
        var i = document.createElement("iframe");
        document.body.appendChild(i),
          !e &&
            /^data:/.test(t) &&
            (t = "data:" + t.replace(/^data:([\w\/\-\+]+)/, s)),
          (i.src = t),
          setTimeout(function () {
            document.body.removeChild(i);
          }, 333);
      }
      if (
        ((r = f instanceof c ? f : new c([f], { type: h })),
        navigator.msSaveBlob)
      )
        return navigator.msSaveBlob(r, p);
      if (a.URL) b(a.URL.createObjectURL(r), !0);
      else {
        if ("string" == typeof r || r.constructor === l)
          try {
            return b("data:" + h + ";base64," + a.btoa(r));
          } catch (t) {
            return b("data:" + h + "," + encodeURIComponent(r));
          }
        ((o = new FileReader()).onload = function (t) {
          b(this.result);
        }),
          o.readAsDataURL(r);
      }
      return !0;
    };
  }),
  (function () {
    var s = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "+",
      "/",
    ];
    function o(t) {
      var e,
        i = new Uint8Array(t);
      for (e = 0; e < t; e += 1) i[e] = 0;
      return i;
    }
    (window.utils = {}),
      (window.utils.clean = o),
      (window.utils.pad = function (t, e, i) {
        return (
          (t = t.toString(i || 8)), "000000000000".substr(t.length + 12 - e) + t
        );
      }),
      (window.utils.extend = function (t, e, i, n) {
        var r = o((parseInt((e + i) / n) + 1) * n);
        return r.set(t), r;
      }),
      (window.utils.stringToUint8 = function (t, e, i) {
        var n, r;
        for (
          e = e || o(t.length), i = i || 0, n = 0, r = t.length;
          n < r;
          n += 1
        )
          (e[i] = t.charCodeAt(n)), (i += 1);
        return e;
      }),
      (window.utils.uint8ToBase64 = function (t) {
        var e,
          i,
          n,
          r,
          o = t.length % 3,
          a = "";
        for (e = 0, n = t.length - o; e < n; e += 3)
          (i = (t[e] << 16) + (t[e + 1] << 8) + t[e + 2]),
            (a +=
              s[((r = i) >> 18) & 63] +
              s[(r >> 12) & 63] +
              s[(r >> 6) & 63] +
              s[63 & r]);
        switch (a.length % 4) {
          case 1:
            a += "=";
            break;
          case 2:
            a += "==";
        }
        return a;
      });
  })(),
  (function () {
    var e,
      i = window.utils;
    (e = [
      { field: "fileName", length: 100 },
      { field: "fileMode", length: 8 },
      { field: "uid", length: 8 },
      { field: "gid", length: 8 },
      { field: "fileSize", length: 12 },
      { field: "mtime", length: 12 },
      { field: "checksum", length: 8 },
      { field: "type", length: 1 },
      { field: "linkName", length: 100 },
      { field: "ustar", length: 8 },
      { field: "owner", length: 32 },
      { field: "group", length: 32 },
      { field: "majorNumber", length: 8 },
      { field: "minorNumber", length: 8 },
      { field: "filenamePrefix", length: 155 },
      { field: "padding", length: 12 },
    ]),
      (window.header = {}),
      (window.header.structure = e),
      (window.header.format = function (r, t) {
        var o = i.clean(512),
          a = 0;
        return (
          e.forEach(function (t) {
            var e,
              i,
              n = r[t.field] || "";
            for (e = 0, i = n.length; e < i; e += 1)
              (o[a] = n.charCodeAt(e)), (a += 1);
            a += t.length - e;
          }),
          "function" == typeof t ? t(o, a) : o
        );
      });
  })(),
  (function () {
    var e,
      c = window.header,
      p = window.utils;
    function t(t) {
      (this.written = 0),
        (e = 512 * (t || 20)),
        (this.out = p.clean(e)),
        (this.blocks = []),
        (this.length = 0);
    }
    (t.prototype.append = function (t, e, i, n) {
      var r, o, a, s, h, f, d;
      if ("string" == typeof e) e = p.stringToUint8(e);
      else if (e.constructor !== Uint8Array.prototype.constructor)
        throw (
          "Invalid input type. You gave me: " +
          e.constructor
            .toString()
            .match(/function\s*([$A-Za-z_][0-9A-Za-z_]*)\s*\(/)[1]
        );
      "function" == typeof i && (i, (i = {})),
        (a = (i = i || {}).mode || 4095 & parseInt("777", 8)),
        (s = i.mtime || Math.floor(+new Date() / 1e3)),
        (h = i.uid || 0),
        (f = i.gid || 0),
        (r = {
          fileName: t,
          fileMode: p.pad(a, 7),
          uid: p.pad(h, 7),
          gid: p.pad(f, 7),
          fileSize: p.pad(e.length, 11),
          mtime: p.pad(s, 11),
          checksum: "        ",
          type: "0",
          ustar: "ustar  ",
          owner: i.owner || "",
          group: i.group || "",
        }),
        (o = 0),
        Object.keys(r).forEach(function (t) {
          var e,
            i,
            n = r[t];
          for (e = 0, i = n.length; e < i; e += 1) o += n.charCodeAt(e);
        }),
        (r.checksum = p.pad(o, 6) + "\0 "),
        (d = c.format(r));
      var u = 512 * Math.ceil(d.length / 512),
        l = 512 * Math.ceil(e.length / 512);
      this.blocks.push({
        header: d,
        input: e,
        headerLength: u,
        inputLength: l,
      });
    }),
      (t.prototype.save = function () {
        var n = [],
          e = [],
          i = 0,
          r = Math.pow(2, 20),
          o = [];
        return (
          this.blocks.forEach(function (t) {
            i + t.headerLength + t.inputLength > r &&
              (e.push({ blocks: o, length: i }), (o = []), (i = 0)),
              o.push(t),
              (i += t.headerLength + t.inputLength);
          }),
          e.push({ blocks: o, length: i }),
          e.forEach(function (t) {
            var e = new Uint8Array(t.length),
              i = 0;
            t.blocks.forEach(function (t) {
              e.set(t.header, i),
                (i += t.headerLength),
                e.set(t.input, i),
                (i += t.inputLength);
            }),
              n.push(e);
          }),
          n.push(new Uint8Array(1024)),
          new Blob(n, { type: "octet/stream" })
        );
      }),
      (t.prototype.clear = function () {
        (this.written = 0), (this.out = p.clean(e));
      }),
      "undefined" != typeof module && void 0 !== module.exports
        ? (module.exports = t)
        : (window.Tar = t);
  })(),
  function (t) {
    function d(t, e) {
      if ({}.hasOwnProperty.call(d.cache, t)) return d.cache[t];
      var i = d.resolve(t);
      if (!i) throw new Error("Failed to resolve module " + t);
      var n = {
        id: t,
        require: d,
        filename: t,
        exports: {},
        loaded: !1,
        parent: e,
        children: [],
      };
      e && e.children.push(n);
      var r = t.slice(0, t.lastIndexOf("/") + 1);
      return (
        (d.cache[t] = n.exports),
        i.call(n.exports, n, n.exports, r, t),
        (n.loaded = !0),
        (d.cache[t] = n.exports)
      );
    }
    (d.modules = {}),
      (d.cache = {}),
      (d.resolve = function (t) {
        return {}.hasOwnProperty.call(d.modules, t) ? d.modules[t] : void 0;
      }),
      (d.define = function (t, e) {
        d.modules[t] = e;
      });
    var e,
      o =
        ((e = "/"),
        {
          title: "browser",
          version: "v0.10.26",
          browser: !0,
          env: {},
          argv: [],
          nextTick:
            t.setImmediate ||
            function (t) {
              setTimeout(t, 0);
            },
          cwd: function () {
            return e;
          },
          chdir: function (t) {
            e = t;
          },
        });
    d.define("/gif.coffee", function (t, e, i, n) {
      function r(t, e) {
        return {}.hasOwnProperty.call(t, e);
      }
      var o, a, s, h, f;
      (s = d("events", t).EventEmitter),
        (o = d("/browser.coffee", t)),
        (f = (function (t) {
          function e(t) {
            var e, i;
            for (e in ((this.running = !1),
            (this.options = {}),
            (this.frames = []),
            (this.freeWorkers = []),
            (this.activeWorkers = []),
            this.setOptions(t),
            a))
              (i = a[e]),
                null != this.options[e]
                  ? this.options[e]
                  : (this.options[e] = i);
          }
          return (
            (function (t, e) {
              function i() {
                this.constructor = t;
              }
              for (var n in e) r(e, n) && (t[n] = e[n]);
              (i.prototype = e.prototype),
                (t.prototype = new i()),
                (t.__super__ = e.prototype);
            })(e, s),
            (h = {
              delay: 500,
              copy: !(a = {
                workerScript: "gif.worker.js",
                workers: 2,
                repeat: 0,
                background: "#fff",
                quality: 10,
                width: null,
                height: null,
                transparent: null,
              }),
            }),
            (e.prototype.setOption = function (t, e) {
              return (
                (this.options[t] = e),
                null == this._canvas || ("width" !== t && "height" !== t)
                  ? void 0
                  : (this._canvas[t] = e)
              );
            }),
            (e.prototype.setOptions = function (e) {
              var i, n;
              return function (t) {
                for (i in e)
                  r(e, i) && ((n = e[i]), t.push(this.setOption(i, n)));
                return t;
              }.call(this, []);
            }),
            (e.prototype.addFrame = function (t, e) {
              var i, n;
              for (n in (null == e && (e = {}),
              ((i = {}).transparent = this.options.transparent),
              h))
                i[n] = e[n] || h[n];
              if (
                (null != this.options.width || this.setOption("width", t.width),
                null != this.options.height ||
                  this.setOption("height", t.height),
                "undefined" != typeof ImageData &&
                  null != ImageData &&
                  t instanceof ImageData)
              )
                i.data = t.data;
              else if (
                ("undefined" != typeof CanvasRenderingContext2D &&
                  null != CanvasRenderingContext2D &&
                  t instanceof CanvasRenderingContext2D) ||
                ("undefined" != typeof WebGLRenderingContext &&
                  null != WebGLRenderingContext &&
                  t instanceof WebGLRenderingContext)
              )
                e.copy ? (i.data = this.getContextData(t)) : (i.context = t);
              else {
                if (null == t.childNodes) throw new Error("Invalid image");
                e.copy ? (i.data = this.getImageData(t)) : (i.image = t);
              }
              return this.frames.push(i);
            }),
            (e.prototype.render = function () {
              var i;
              if (this.running) throw new Error("Already running");
              if (null == this.options.width || null == this.options.height)
                throw new Error(
                  "Width and height must be set prior to rendering"
                );
              (this.running = !0),
                (this.nextFrame = 0),
                (this.finishedFrames = 0),
                (this.imageParts = function (t) {
                  for (
                    var e = function () {
                        var t;
                        t = [];
                        for (
                          var e = 0;
                          0 <= this.frames.length
                            ? e < this.frames.length
                            : e > this.frames.length;
                          0 <= this.frames.length ? ++e : --e
                        )
                          t.push(e);
                        return t;
                      }.apply(this, arguments),
                      i = 0,
                      n = e.length;
                    i < n;
                    ++i
                  )
                    e[i], t.push(null);
                  return t;
                }.call(this, [])),
                (i = this.spawnWorkers());
              for (
                var t = function () {
                    var t;
                    t = [];
                    for (var e = 0; 0 <= i ? e < i : i < e; 0 <= i ? ++e : --e)
                      t.push(e);
                    return t;
                  }.apply(this, arguments),
                  e = 0,
                  n = t.length;
                e < n;
                ++e
              )
                t[e], this.renderNextFrame();
              return this.emit("start"), this.emit("progress", 0);
            }),
            (e.prototype.abort = function () {
              for (var t; null != (t = this.activeWorkers.shift()); )
                console.log("killing active worker"), t.terminate();
              return (this.running = !1), this.emit("abort");
            }),
            (e.prototype.spawnWorkers = function () {
              var i, n;
              return (
                (i = Math.min(this.options.workers, this.frames.length)),
                function () {
                  var t;
                  t = [];
                  for (
                    var e = this.freeWorkers.length;
                    this.freeWorkers.length <= i ? e < i : i < e;
                    this.freeWorkers.length <= i ? ++e : --e
                  )
                    t.push(e);
                  return t;
                }
                  .apply(this, arguments)
                  .forEach(
                    ((n = this),
                    function (t) {
                      var e, i;
                      return (
                        console.log("spawning worker " + t),
                        ((e = new Worker(
                          // Dumb fix
                          URL.createObjectURL(
                            new Blob(["(" + gifWorker.toString() + ")()"], {
                              type: "text/javascript",
                            })
                          )
                        )).onmessage =
                          ((i = n),
                          function (t) {
                            return (
                              i.activeWorkers.splice(
                                i.activeWorkers.indexOf(e),
                                1
                              ),
                              i.freeWorkers.push(e),
                              i.frameFinished(t.data)
                            );
                          })),
                        n.freeWorkers.push(e)
                      );
                    })
                  ),
                i
              );
            }),
            (e.prototype.frameFinished = function (t) {
              return (
                console.log(
                  "frame " +
                    t.index +
                    " finished - " +
                    this.activeWorkers.length +
                    " active"
                ),
                this.finishedFrames++,
                this.emit("progress", this.finishedFrames / this.frames.length),
                (this.imageParts[t.index] = t),
                (function (t, e) {
                  for (var i = 0, n = e.length; i < n; ++i)
                    if (i in e && e[i] === t) return !0;
                  return !1;
                })(null, this.imageParts)
                  ? this.renderNextFrame()
                  : this.finishRendering()
              );
            }),
            (e.prototype.finishRendering = function () {
              for (
                var t,
                  e,
                  i,
                  n,
                  r,
                  o,
                  a,
                  s = (r = 0),
                  h = this.imageParts.length;
                s < h;
                ++s
              )
                r +=
                  ((e = this.imageParts[s]).data.length - 1) * e.pageSize +
                  e.cursor;
              (r += e.pageSize - e.cursor),
                console.log(
                  "rendering finished - filesize " + Math.round(r / 1e3) + "kb"
                ),
                (t = new Uint8Array(r));
              for (var f = (o = 0), d = this.imageParts.length; f < d; ++f)
                for (
                  var u = 0, l = (e = this.imageParts[f]).data.length;
                  u < l;
                  ++u
                )
                  (a = e.data[u]),
                    (i = u),
                    t.set(a, o),
                    i === e.data.length - 1
                      ? (o += e.cursor)
                      : (o += e.pageSize);
              return (
                (n = new Blob([t], { type: "image/gif" })),
                this.emit("finished", n, t)
              );
            }),
            (e.prototype.renderNextFrame = function () {
              var t, e, i;
              if (0 === this.freeWorkers.length)
                throw new Error("No free workers");
              return this.nextFrame >= this.frames.length
                ? void 0
                : ((t = this.frames[this.nextFrame++]),
                  (i = this.freeWorkers.shift()),
                  (e = this.getTask(t)),
                  console.log(
                    "starting frame " +
                      (e.index + 1) +
                      " of " +
                      this.frames.length
                  ),
                  this.activeWorkers.push(i),
                  i.postMessage(e));
            }),
            (e.prototype.getContextData = function (t) {
              return t.getImageData(
                0,
                0,
                this.options.width,
                this.options.height
              ).data;
            }),
            (e.prototype.getImageData = function (t) {
              var e;
              return (
                null != this._canvas ||
                  ((this._canvas = document.createElement("canvas")),
                  (this._canvas.width = this.options.width),
                  (this._canvas.height = this.options.height)),
                ((e = this._canvas.getContext("2d")).setFill =
                  this.options.background),
                e.fillRect(0, 0, this.options.width, this.options.height),
                e.drawImage(t, 0, 0),
                this.getContextData(e)
              );
            }),
            (e.prototype.getTask = function (t) {
              var e, i;
              if (
                ((i = {
                  index: (e = this.frames.indexOf(t)),
                  last: e === this.frames.length - 1,
                  delay: t.delay,
                  transparent: t.transparent,
                  width: this.options.width,
                  height: this.options.height,
                  quality: this.options.quality,
                  repeat: this.options.repeat,
                  canTransfer: "chrome" === o.name,
                }),
                null != t.data)
              )
                i.data = t.data;
              else if (null != t.context)
                i.data = this.getContextData(t.context);
              else {
                if (null == t.image) throw new Error("Invalid frame");
                i.data = this.getImageData(t.image);
              }
              return i;
            }),
            e
          );
        })()),
        (t.exports = f);
    }),
      d.define("/browser.coffee", function (t, e, i, n) {
        var r, o, a, s, h;
        (s = navigator.userAgent.toLowerCase()),
          (a = navigator.platform.toLowerCase()),
          (o =
            "ie" ===
              (h = s.match(
                /(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/
              ) || [null, "unknown", 0])[1] && document.documentMode),
          ((r = {
            name: "version" === h[1] ? h[3] : h[1],
            version: o || parseFloat("opera" === h[1] && h[4] ? h[4] : h[2]),
            platform: {
              name: s.match(/ip(?:ad|od|hone)/)
                ? "ios"
                : (s.match(/(?:webos|android)/) ||
                    a.match(/mac|win|linux/) || ["other"])[0],
            },
          })[r.name] = !0),
          (r[r.name + parseInt(r.version, 10)] = !0),
          (r.platform[r.platform.name] = !0),
          (t.exports = r);
      }),
      d.define("events", function (t, e, i, n) {
        o.EventEmitter || (o.EventEmitter = function () {});
        var r = (e.EventEmitter = o.EventEmitter),
          a =
            "function" == typeof Array.isArray
              ? Array.isArray
              : function (t) {
                  return "[object Array]" === Object.prototype.toString.call(t);
                };
        (r.prototype.setMaxListeners = function (t) {
          this._events || (this._events = {}), (this._events.maxListeners = t);
        }),
          (r.prototype.emit = function (t) {
            if (
              "error" === t &&
              (!this._events ||
                !this._events.error ||
                (a(this._events.error) && !this._events.error.length))
            )
              throw arguments[1] instanceof Error
                ? arguments[1]
                : new Error("Uncaught, unspecified 'error' event.");
            if (!this._events) return !1;
            var e = this._events[t];
            if (!e) return !1;
            if ("function" != typeof e) {
              if (a(e)) {
                for (
                  var i = Array.prototype.slice.call(arguments, 1),
                    n = e.slice(),
                    r = 0,
                    o = n.length;
                  r < o;
                  r++
                )
                  n[r].apply(this, i);
                return !0;
              }
              return !1;
            }
            switch (arguments.length) {
              case 1:
                e.call(this);
                break;
              case 2:
                e.call(this, arguments[1]);
                break;
              case 3:
                e.call(this, arguments[1], arguments[2]);
                break;
              default:
                i = Array.prototype.slice.call(arguments, 1);
                e.apply(this, i);
            }
            return !0;
          }),
          (r.prototype.addListener = function (t, e) {
            if ("function" != typeof e)
              throw new Error("addListener only takes instances of Function");
            if (
              (this._events || (this._events = {}),
              this.emit("newListener", t, e),
              this._events[t])
            )
              if (a(this._events[t])) {
                var i;
                if (!this._events[t].warned)
                  (i =
                    void 0 !== this._events.maxListeners
                      ? this._events.maxListeners
                      : 10) &&
                    0 < i &&
                    this._events[t].length > i &&
                    ((this._events[t].warned = !0),
                    console.error(
                      "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
                      this._events[t].length
                    ),
                    console.trace());
                this._events[t].push(e);
              } else this._events[t] = [this._events[t], e];
            else this._events[t] = e;
            return this;
          }),
          (r.prototype.on = r.prototype.addListener),
          (r.prototype.once = function (e, i) {
            var n = this;
            return (
              n.on(e, function t() {
                n.removeListener(e, t), i.apply(this, arguments);
              }),
              this
            );
          }),
          (r.prototype.removeListener = function (t, e) {
            if ("function" != typeof e)
              throw new Error(
                "removeListener only takes instances of Function"
              );
            if (!this._events || !this._events[t]) return this;
            var i = this._events[t];
            if (a(i)) {
              var n = i.indexOf(e);
              if (n < 0) return this;
              i.splice(n, 1), 0 == i.length && delete this._events[t];
            } else this._events[t] === e && delete this._events[t];
            return this;
          }),
          (r.prototype.removeAllListeners = function (t) {
            return (
              t && this._events && this._events[t] && (this._events[t] = null),
              this
            );
          }),
          (r.prototype.listeners = function (t) {
            return (
              this._events || (this._events = {}),
              this._events[t] || (this._events[t] = []),
              a(this._events[t]) || (this._events[t] = [this._events[t]]),
              this._events[t]
            );
          });
      }),
      (t.GIF = d("/gif.coffee"));
  }.call(this, this),
  (function () {
    var t = "undefined" != typeof module && void 0 !== module.exports,
      e = t ? require("./tar") : window.Tar,
      R = t ? require("./download") : window.download,
      i = t ? require("./gif").GIF : window.GIF,
      n = t ? require("./webm-writer-0.2.0") : window.WebMWriter,
      r = { function: !0, object: !0 };
    function o(t) {
      return t && t.Object === Object ? t : null;
    }
    parseFloat, parseInt;
    var a =
        r[typeof exports] && exports && !exports.nodeType ? exports : void 0,
      s = r[typeof module] && module && !module.nodeType ? module : void 0,
      h = s && s.exports === a ? a : void 0,
      f = o(a && s && "object" == typeof global && global),
      d = o(r[typeof self] && self),
      u = o(r[typeof window] && window),
      l = o(r[typeof this] && this),
      c =
        f ||
        (u !== (l && l.window) && u) ||
        d ||
        l ||
        Function("return this")();
    function p(t) {
      return String("0000000" + t).slice(-7);
    }
    "gc" in window || (window.gc = function () {}),
      HTMLCanvasElement.prototype.toBlob ||
        Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
          value: function (t, e, i) {
            for (
              var n = atob(this.toDataURL(e, i).split(",")[1]),
                r = n.length,
                o = new Uint8Array(r),
                a = 0;
              a < r;
              a++
            )
              o[a] = n.charCodeAt(a);
            t(new Blob([o], { type: e || "image/png" }));
          },
        }),
      (function () {
        if (
          ("performance" in window == 0 && (window.performance = {}),
          (Date.now =
            Date.now ||
            function () {
              return new Date().getTime();
            }),
          "now" in window.performance == 0)
        ) {
          var t = Date.now();
          performance.timing &&
            performance.timing.navigationStart &&
            (t = performance.timing.navigationStart),
            (window.performance.now = function () {
              return Date.now() - t;
            });
        }
      })();
    var P = window.Date.now();
    function m(t) {
      var i = {};
      (this.settings = t),
        (this.on = function (t, e) {
          i[t] = e;
        }),
        (this.emit = function (t) {
          var e = i[t];
          e && e.apply(null, Array.prototype.slice.call(arguments, 1));
        }),
        (this.filename =
          t.name ||
          (function () {
            function t() {
              return Math.floor(65536 * (1 + Math.random()))
                .toString(16)
                .substring(1);
            }
            return (
              t() +
              t() +
              "-" +
              t() +
              "-" +
              t() +
              "-" +
              t() +
              "-" +
              t() +
              t() +
              t()
            );
          })()),
        (this.extension = ""),
        (this.mimeType = "");
    }
    function w(t) {
      m.call(this, t),
        (this.extension = ".tar"),
        (this.mimeType = "application/x-tar"),
        (this.fileExtension = ""),
        (this.baseFilename = this.filename),
        (this.tape = null),
        (this.count = 0),
        (this.part = 1),
        (this.frames = 0);
    }
    function j(t) {
      w.call(this, t), (this.type = "image/png"), (this.fileExtension = ".png");
    }
    function q(t) {
      w.call(this, t),
        (this.type = "image/jpeg"),
        (this.fileExtension = ".jpg"),
        (this.quality = t.quality / 100 || 0.8);
    }
    function z(t) {
      "image/webp" !==
        document
          .createElement("canvas")
          .toDataURL("image/webp")
          .substr(5, 10) &&
        console.log("WebP not supported - try another export format"),
        m.call(this, t),
        (this.quality = t.quality / 100 || 0.8),
        (this.extension = ".webm"),
        (this.mimeType = "video/webm"),
        (this.baseFilename = this.filename),
        (this.framerate = t.framerate),
        (this.frames = 0),
        (this.part = 1),
        (this.videoWriter = new n({
          quality: this.quality,
          fileWriter: null,
          fd: null,
          frameRate: this.framerate,
        }));
    }
    function N(t) {
      m.call(this, t),
        (t.quality = t.quality / 100 || 0.8),
        (this.encoder = new FFMpegServer.Video(t)),
        this.encoder.on(
          "process",
          function () {
            this.emit("process");
          }.bind(this)
        ),
        this.encoder.on(
          "finished",
          function (t, e) {
            var i = this.callback;
            i && ((this.callback = void 0), i(t, e));
          }.bind(this)
        ),
        this.encoder.on(
          "progress",
          function (t) {
            this.settings.onProgress && this.settings.onProgress(t);
          }.bind(this)
        ),
        this.encoder.on(
          "error",
          function (t) {
            alert(JSON.stringify(t, null, 2));
          }.bind(this)
        );
    }
    function V(t) {
      m.call(this, t),
        (this.framerate = this.settings.framerate),
        (this.type = "video/webm"),
        (this.extension = ".webm"),
        (this.stream = null),
        (this.mediaRecorder = null),
        (this.chunks = []);
    }
    function G(t) {
      m.call(this, t),
        (t.quality = 31 - ((30 * t.quality) / 100 || 10)),
        (t.workers = t.workers || 4),
        (this.extension = ".gif"),
        (this.mimeType = "image/gif"),
        (this.canvas = document.createElement("canvas")),
        (this.ctx = this.canvas.getContext("2d")),
        (this.sizeSet = !1),
        (this.encoder = new i({
          workers: t.workers,
          quality: t.quality,
          workerScript: t.workersPath + "gif.worker.js",
        })),
        this.encoder.on(
          "progress",
          function (t) {
            this.settings.onProgress && this.settings.onProgress(t);
          }.bind(this)
        ),
        this.encoder.on(
          "finished",
          function (t) {
            var e = this.callback;
            e && ((this.callback = void 0), e(t));
          }.bind(this)
        );
    }
    function g(t) {
      var e,
        n,
        r,
        o,
        a,
        i,
        s,
        h = t || {},
        f = (new Date(), []),
        d = [],
        u = 0,
        l = 0,
        c = [],
        p = !1,
        m = {};
      (h.framerate = h.framerate || 60),
        (h.motionBlurFrames = 2 * (h.motionBlurFrames || 1)),
        (e = h.verbose || !1),
        h.display,
        (h.step = 1e3 / h.framerate),
        (h.timeLimit = h.timeLimit || 0),
        (h.frameLimit = h.frameLimit || 0),
        (h.startTime = h.startTime || 0);
      var w = document.createElement("div");
      (w.style.position = "absolute"),
        (w.style.left = w.style.top = 0),
        (w.style.backgroundColor = "black"),
        (w.style.fontFamily = "monospace"),
        (w.style.fontSize = "11px"),
        (w.style.padding = "5px"),
        (w.style.color = "red"),
        (w.style.zIndex = 1e5),
        h.display && document.body.appendChild(w);
      var g,
        y,
        v = document.createElement("canvas"),
        b = v.getContext("2d");
      W("Step is set to " + h.step + "ms");
      var k = {
          gif: G,
          webm: z,
          ffmpegserver: N,
          png: j,
          jpg: q,
          "webm-mediarecorder": V,
        },
        x = k[h.format];
      if (!x)
        throw (
          "Error: Incorrect or missing format: Valid formats are " +
          Object.keys(k).join(", ")
        );
      if (
        (((s = new x(h)).step = i),
        s.on("process", O),
        s.on("progress", function (t) {
          !(function (t) {
            var e = m[t];
            e && e.apply(null, Array.prototype.slice.call(arguments, 1));
          })("progress", t);
        }),
        "performance" in window == 0 && (window.performance = {}),
        (Date.now =
          Date.now ||
          function () {
            return new Date().getTime();
          }),
        "now" in window.performance == 0)
      ) {
        var E = Date.now();
        performance.timing &&
          performance.timing.navigationStart &&
          (E = performance.timing.navigationStart),
          (window.performance.now = function () {
            return Date.now() - E;
          });
      }
      var B = window.setTimeout,
        L = window.setInterval,
        A = window.clearInterval,
        T = window.clearTimeout,
        U = window.requestAnimationFrame,
        F = window.Date.now,
        I = window.performance.now,
        D = window.Date.prototype.getTime,
        _ = [];
      function M() {
        (p = !1),
          s.stop(),
          W("Capturer stop"),
          (window.setTimeout = B),
          (window.setInterval = L),
          (window.clearInterval = A),
          (window.clearTimeout = T),
          (window.requestAnimationFrame = U),
          (window.Date.prototype.getTime = D),
          (window.Date.now = F),
          (window.performance.now = I);
      }
      function C(t, e) {
        B(t, 0, e);
      }
      function i() {
        C(O);
      }
      function O() {
        var t = 1e3 / h.framerate,
          e = (u + l / h.motionBlurFrames) * t;
        (n = r + e),
          (o = a + e),
          _.forEach(function (t) {
            t._hookedTime = e / 1e3;
          }),
          (function () {
            var t = u / h.framerate;
            ((h.frameLimit && u >= h.frameLimit) ||
              (h.timeLimit && t >= h.timeLimit)) &&
              (M(), S());
            var e = new Date(null);
            e.setSeconds(t),
              2 < h.motionBlurFrames
                ? (w.textContent =
                    "CCapture " +
                    h.format +
                    " | " +
                    u +
                    " frames (" +
                    l +
                    " inter) | " +
                    e.toISOString().substr(11, 8))
                : (w.textContent =
                    "CCapture " +
                    h.format +
                    " | " +
                    u +
                    " frames | " +
                    e.toISOString().substr(11, 8));
          })(),
          W("Frame: " + u + " " + l);
        for (var i = 0; i < f.length; i++)
          n >= f[i].triggerTime && (C(f[i].callback), f.splice(i, 1));
        for (i = 0; i < d.length; i++)
          n >= d[i].triggerTime &&
            (C(d[i].callback), (d[i].triggerTime += d[i].time));
        c.forEach(function (t) {
          C(t, n - P);
        }),
          (c = []);
      }
      function S(t) {
        t ||
          (t = function (t) {
            return R(t, s.filename + s.extension, s.mimeType), !1;
          }),
          s.save(t);
      }
      function W(t) {
        e && console.log(t);
      }
      return {
        start: function () {
          !(function () {
            function t() {
              return (
                this._hooked ||
                  ((this._hooked = !0),
                  (this._hookedTime = this.currentTime || 0),
                  this.pause(),
                  _.push(this)),
                this._hookedTime + h.startTime
              );
            }
            W("Capturer start"),
              (r = window.Date.now()),
              (n = r + h.startTime),
              (a = window.performance.now()),
              (o = a + h.startTime),
              (window.Date.prototype.getTime = function () {
                return n;
              }),
              (window.Date.now = function () {
                return n;
              }),
              (window.setTimeout = function (t, e) {
                var i = { callback: t, time: e, triggerTime: n + e };
                return f.push(i), W("Timeout set to " + i.time), i;
              }),
              (window.clearTimeout = function (t) {
                for (var e = 0; e < f.length; e++)
                  f[e] != t || (f.splice(e, 1), W("Timeout cleared"));
              }),
              (window.setInterval = function (t, e) {
                var i = { callback: t, time: e, triggerTime: n + e };
                return d.push(i), W("Interval set to " + i.time), i;
              }),
              (window.clearInterval = function (t) {
                return W("clear Interval"), null;
              }),
              (window.requestAnimationFrame = function (t) {
                c.push(t);
              }),
              (window.performance.now = function () {
                return o;
              });
            try {
            //   Object.defineProperty(HTMLVideoElement.prototype, "currentTime", {
            //     get: t,
            //   }),
            //     Object.defineProperty(
            //       HTMLAudioElement.prototype,
            //       "currentTime",
            //       { get: t }
            //     );
            } catch (t) {
              W(t);
            }
          })(),
            s.start(),
            (p = !0);
        },
        capture: function (t) {
          var e;
          p &&
            (2 < h.motionBlurFrames
              ? ((e = t),
                (v.width === e.width && v.height === e.height) ||
                  ((v.width = e.width),
                  (v.height = e.height),
                  (g = new Uint16Array(v.height * v.width * 4)),
                  (b.fillStyle = "#0"),
                  b.fillRect(0, 0, v.width, v.height)),
                (function (t) {
                  b.drawImage(t, 0, 0),
                    (y = b.getImageData(0, 0, v.width, v.height));
                  for (var e = 0; e < g.length; e += 4)
                    (g[e] += y.data[e]),
                      (g[e + 1] += y.data[e + 1]),
                      (g[e + 2] += y.data[e + 2]);
                  l++;
                })(t),
                l >= 0.5 * h.motionBlurFrames
                  ? (function () {
                      for (var t = y.data, e = 0; e < g.length; e += 4)
                        (t[e] = (2 * g[e]) / h.motionBlurFrames),
                          (t[e + 1] = (2 * g[e + 1]) / h.motionBlurFrames),
                          (t[e + 2] = (2 * g[e + 2]) / h.motionBlurFrames);
                      for (
                        b.putImageData(y, 0, 0),
                          s.add(v),
                          l = 0,
                          W("Full MB Frame! " + ++u + " " + n),
                          e = 0;
                        e < g.length;
                        e += 4
                      )
                        (g[e] = 0), (g[e + 1] = 0), (g[e + 2] = 0);
                      gc();
                    })()
                  : i())
              : (s.add(t), W("Full Frame! " + ++u)));
        },
        stop: M,
        save: S,
        on: function (t, e) {
          m[t] = e;
        },
      };
    }
    (m.prototype.start = function () {}),
      (m.prototype.stop = function () {}),
      (m.prototype.add = function () {}),
      (m.prototype.save = function () {}),
      (m.prototype.dispose = function () {}),
      (m.prototype.safeToProceed = function () {
        return !0;
      }),
      (m.prototype.step = function () {
        console.log("Step not set!");
      }),
      ((w.prototype = Object.create(m.prototype)).start = function () {
        this.dispose();
      }),
      (w.prototype.add = function (t) {
        var e = new FileReader();
        (e.onload = function () {
          this.tape.append(
            p(this.count) + this.fileExtension,
            new Uint8Array(e.result)
          ),
            0 < this.settings.autoSaveTime &&
            this.frames / this.settings.framerate >= this.settings.autoSaveTime
              ? this.save(
                  function (t) {
                    (this.filename =
                      this.baseFilename + "-part-" + p(this.part)),
                      R(t, this.filename + this.extension, this.mimeType);
                    var e = this.count;
                    this.dispose(),
                      (this.count = e + 1),
                      this.part++,
                      (this.filename =
                        this.baseFilename + "-part-" + p(this.part)),
                      (this.frames = 0),
                      this.step();
                  }.bind(this)
                )
              : (this.count++, this.frames++, this.step());
        }.bind(this)),
          e.readAsArrayBuffer(t);
      }),
      (w.prototype.save = function (t) {
        t(this.tape.save());
      }),
      (w.prototype.dispose = function () {
        (this.tape = new e()), (this.count = 0);
      }),
      ((j.prototype = Object.create(w.prototype)).add = function (t) {
        t.toBlob(
          function (t) {
            w.prototype.add.call(this, t);
          }.bind(this),
          this.type
        );
      }),
      ((q.prototype = Object.create(w.prototype)).add = function (t) {
        t.toBlob(
          function (t) {
            w.prototype.add.call(this, t);
          }.bind(this),
          this.type,
          this.quality
        );
      }),
      ((z.prototype = Object.create(m.prototype)).start = function (t) {
        this.dispose();
      }),
      (z.prototype.add = function (t) {
        this.videoWriter.addFrame(t),
          0 < this.settings.autoSaveTime &&
          this.frames / this.settings.framerate >= this.settings.autoSaveTime
            ? this.save(
                function (t) {
                  (this.filename = this.baseFilename + "-part-" + p(this.part)),
                    R(t, this.filename + this.extension, this.mimeType),
                    this.dispose(),
                    this.part++,
                    (this.filename =
                      this.baseFilename + "-part-" + p(this.part)),
                    this.step();
                }.bind(this)
              )
            : (this.frames++, this.step());
      }),
      (z.prototype.save = function (t) {
        this.videoWriter.complete().then(t);
      }),
      (z.prototype.dispose = function (t) {
        (this.frames = 0),
          (this.videoWriter = new n({
            quality: this.quality,
            fileWriter: null,
            fd: null,
            frameRate: this.framerate,
          }));
      }),
      ((N.prototype = Object.create(m.prototype)).start = function () {
        this.encoder.start(this.settings);
      }),
      (N.prototype.add = function (t) {
        this.encoder.add(t);
      }),
      (N.prototype.save = function (t) {
        (this.callback = t), this.encoder.end();
      }),
      (N.prototype.safeToProceed = function () {
        return this.encoder.safeToProceed();
      }),
      ((V.prototype = Object.create(m.prototype)).add = function (t) {
        this.stream ||
          ((this.stream = t.captureStream(this.framerate)),
          (this.mediaRecorder = new MediaRecorder(this.stream)),
          this.mediaRecorder.start(),
          (this.mediaRecorder.ondataavailable = function (t) {
            this.chunks.push(t.data);
          }.bind(this))),
          this.step();
      }),
      (V.prototype.save = function (i) {
        (this.mediaRecorder.onstop = function (t) {
          var e = new Blob(this.chunks, { type: "video/webm" });
          (this.chunks = []), i(e);
        }.bind(this)),
          this.mediaRecorder.stop();
      }),
      ((G.prototype = Object.create(m.prototype)).add = function (t) {
        this.sizeSet ||
          (this.encoder.setOption("width", t.width),
          this.encoder.setOption("height", t.height),
          (this.sizeSet = !0)),
          (this.canvas.width = t.width),
          (this.canvas.height = t.height),
          this.ctx.drawImage(t, 0, 0),
          this.encoder.addFrame(this.ctx, {
            copy: !0,
            delay: this.settings.step,
          }),
          this.step();
      }),
      (G.prototype.save = function (t) {
        (this.callback = t), this.encoder.render();
      }),
      ((u || d || {}).CCapture = g),
      "function" == typeof define && "object" == typeof define.amd && define.amd
        ? define(function () {
            return g;
          })
        : a && s
        ? (h && ((s.exports = g).CCapture = g), (a.CCapture = g))
        : (c.CCapture = g);
  })();

function gifWorker() {
  (function (b) {
    function a(b, d) {
      if ({}.hasOwnProperty.call(a.cache, b)) return a.cache[b];
      var e = a.resolve(b);
      if (!e) throw new Error("Failed to resolve module " + b);
      var c = {
        id: b,
        require: a,
        filename: b,
        exports: {},
        loaded: !1,
        parent: d,
        children: [],
      };
      d && d.children.push(c);
      var f = b.slice(0, b.lastIndexOf("/") + 1);
      return (
        (a.cache[b] = c.exports),
        e.call(c.exports, c, c.exports, f, b),
        (c.loaded = !0),
        (a.cache[b] = c.exports)
      );
    }
    (a.modules = {}),
      (a.cache = {}),
      (a.resolve = function (b) {
        return {}.hasOwnProperty.call(a.modules, b) ? a.modules[b] : void 0;
      }),
      (a.define = function (b, c) {
        a.modules[b] = c;
      }),
      a.define("/gif.worker.coffee", function (d, e, f, g) {
        var b, c;
        (b = a("/GIFEncoder.js", d)),
          (c = function (a) {
            var c, e, d, f;
            return (
              (c = new b(a.width, a.height)),
              a.index === 0 ? c.writeHeader() : (c.firstFrame = !1),
              c.setTransparent(a.transparent),
              c.setRepeat(a.repeat),
              c.setDelay(a.delay),
              c.setQuality(a.quality),
              c.addFrame(a.data),
              a.last && c.finish(),
              (d = c.stream()),
              (a.data = d.pages),
              (a.cursor = d.cursor),
              (a.pageSize = d.constructor.pageSize),
              a.canTransfer
                ? ((f = function (c) {
                    for (var b = 0, d = a.data.length; b < d; ++b)
                      (e = a.data[b]), c.push(e.buffer);
                    return c;
                  }.call(this, [])),
                  self.postMessage(a, f))
                : self.postMessage(a)
            );
          }),
          (self.onmessage = function (a) {
            return c(a.data);
          });
      }),
      a.define("/GIFEncoder.js", function (e, h, i, j) {
        function c() {
          (this.page = -1), (this.pages = []), this.newPage();
        }
        function b(a, b) {
          (this.width = ~~a),
            (this.height = ~~b),
            (this.transparent = null),
            (this.transIndex = 0),
            (this.repeat = -1),
            (this.delay = 0),
            (this.image = null),
            (this.pixels = null),
            (this.indexedPixels = null),
            (this.colorDepth = null),
            (this.colorTab = null),
            (this.usedEntry = new Array()),
            (this.palSize = 7),
            (this.dispose = -1),
            (this.firstFrame = !0),
            (this.sample = 10),
            (this.out = new c());
        }
        var f = a("/TypedNeuQuant.js", e),
          g = a("/LZWEncoder.js", e);
        (c.pageSize = 4096), (c.charMap = {});
        for (var d = 0; d < 256; d++) c.charMap[d] = String.fromCharCode(d);
        (c.prototype.newPage = function () {
          (this.pages[++this.page] = new Uint8Array(c.pageSize)),
            (this.cursor = 0);
        }),
          (c.prototype.getData = function () {
            var d = "";
            for (var a = 0; a < this.pages.length; a++)
              for (var b = 0; b < c.pageSize; b++)
                d += c.charMap[this.pages[a][b]];
            return d;
          }),
          (c.prototype.writeByte = function (a) {
            this.cursor >= c.pageSize && this.newPage(),
              (this.pages[this.page][this.cursor++] = a);
          }),
          (c.prototype.writeUTFBytes = function (b) {
            for (var c = b.length, a = 0; a < c; a++)
              this.writeByte(b.charCodeAt(a));
          }),
          (c.prototype.writeBytes = function (b, d, e) {
            for (var c = e || b.length, a = d || 0; a < c; a++)
              this.writeByte(b[a]);
          }),
          (b.prototype.setDelay = function (a) {
            this.delay = Math.round(a / 10);
          }),
          (b.prototype.setFrameRate = function (a) {
            this.delay = Math.round(100 / a);
          }),
          (b.prototype.setDispose = function (a) {
            a >= 0 && (this.dispose = a);
          }),
          (b.prototype.setRepeat = function (a) {
            this.repeat = a;
          }),
          (b.prototype.setTransparent = function (a) {
            this.transparent = a;
          }),
          (b.prototype.addFrame = function (a) {
            (this.image = a),
              this.getImagePixels(),
              this.analyzePixels(),
              this.firstFrame &&
                (this.writeLSD(),
                this.writePalette(),
                this.repeat >= 0 && this.writeNetscapeExt()),
              this.writeGraphicCtrlExt(),
              this.writeImageDesc(),
              this.firstFrame || this.writePalette(),
              this.writePixels(),
              (this.firstFrame = !1);
          }),
          (b.prototype.finish = function () {
            this.out.writeByte(59);
          }),
          (b.prototype.setQuality = function (a) {
            a < 1 && (a = 1), (this.sample = a);
          }),
          (b.prototype.writeHeader = function () {
            this.out.writeUTFBytes("GIF89a");
          }),
          (b.prototype.analyzePixels = function () {
            var g = this.pixels.length,
              d = g / 3;
            this.indexedPixels = new Uint8Array(d);
            var a = new f(this.pixels, this.sample);
            a.buildColormap(), (this.colorTab = a.getColormap());
            var b = 0;
            for (var c = 0; c < d; c++) {
              var e = a.lookupRGB(
                this.pixels[b++] & 255,
                this.pixels[b++] & 255,
                this.pixels[b++] & 255
              );
              (this.usedEntry[e] = !0), (this.indexedPixels[c] = e);
            }
            (this.pixels = null),
              (this.colorDepth = 8),
              (this.palSize = 7),
              this.transparent !== null &&
                (this.transIndex = this.findClosest(this.transparent));
          }),
          (b.prototype.findClosest = function (e) {
            if (this.colorTab === null) return -1;
            var k = (e & 16711680) >> 16,
              l = (e & 65280) >> 8,
              m = e & 255,
              c = 0,
              d = 16777216,
              j = this.colorTab.length;
            for (var a = 0; a < j; ) {
              var f = k - (this.colorTab[a++] & 255),
                g = l - (this.colorTab[a++] & 255),
                h = m - (this.colorTab[a] & 255),
                i = f * f + g * g + h * h,
                b = parseInt(a / 3);
              this.usedEntry[b] && i < d && ((d = i), (c = b)), a++;
            }
            return c;
          }),
          (b.prototype.getImagePixels = function () {
            var a = this.width,
              g = this.height;
            this.pixels = new Uint8Array(a * g * 3);
            var b = this.image,
              c = 0;
            for (var d = 0; d < g; d++)
              for (var e = 0; e < a; e++) {
                var f = d * a * 4 + e * 4;
                (this.pixels[c++] = b[f]),
                  (this.pixels[c++] = b[f + 1]),
                  (this.pixels[c++] = b[f + 2]);
              }
          }),
          (b.prototype.writeGraphicCtrlExt = function () {
            this.out.writeByte(33),
              this.out.writeByte(249),
              this.out.writeByte(4);
            var b, a;
            this.transparent === null ? ((b = 0), (a = 0)) : ((b = 1), (a = 2)),
              this.dispose >= 0 && (a = dispose & 7),
              (a <<= 2),
              this.out.writeByte(0 | a | 0 | b),
              this.writeShort(this.delay),
              this.out.writeByte(this.transIndex),
              this.out.writeByte(0);
          }),
          (b.prototype.writeImageDesc = function () {
            this.out.writeByte(44),
              this.writeShort(0),
              this.writeShort(0),
              this.writeShort(this.width),
              this.writeShort(this.height),
              this.firstFrame
                ? this.out.writeByte(0)
                : this.out.writeByte(128 | this.palSize);
          }),
          (b.prototype.writeLSD = function () {
            this.writeShort(this.width),
              this.writeShort(this.height),
              this.out.writeByte(240 | this.palSize),
              this.out.writeByte(0),
              this.out.writeByte(0);
          }),
          (b.prototype.writeNetscapeExt = function () {
            this.out.writeByte(33),
              this.out.writeByte(255),
              this.out.writeByte(11),
              this.out.writeUTFBytes("NETSCAPE2.0"),
              this.out.writeByte(3),
              this.out.writeByte(1),
              this.writeShort(this.repeat),
              this.out.writeByte(0);
          }),
          (b.prototype.writePalette = function () {
            this.out.writeBytes(this.colorTab);
            var b = 768 - this.colorTab.length;
            for (var a = 0; a < b; a++) this.out.writeByte(0);
          }),
          (b.prototype.writeShort = function (a) {
            this.out.writeByte(a & 255), this.out.writeByte((a >> 8) & 255);
          }),
          (b.prototype.writePixels = function () {
            var a = new g(
              this.width,
              this.height,
              this.indexedPixels,
              this.colorDepth
            );
            a.encode(this.out);
          }),
          (b.prototype.stream = function () {
            return this.out;
          }),
          (e.exports = b);
      }),
      a.define("/LZWEncoder.js", function (e, g, h, i) {
        function f(y, D, C, B) {
          function w(a, b) {
            (r[f++] = a), f >= 254 && t(b);
          }
          function x(b) {
            u(a), (k = i + 2), (j = !0), l(i, b);
          }
          function u(b) {
            for (var a = 0; a < b; ++a) h[a] = -1;
          }
          function A(z, r) {
            var g, t, d, e, y, w, s;
            for (
              q = z,
                j = !1,
                n_bits = q,
                m = p(n_bits),
                i = 1 << (z - 1),
                o = i + 1,
                k = i + 2,
                f = 0,
                e = v(),
                s = 0,
                g = a;
              g < 65536;
              g *= 2
            )
              ++s;
            (s = 8 - s), (w = a), u(w), l(i, r);
            a: while ((t = v()) != c) {
              if (((g = (t << b) + e), (d = (t << s) ^ e), h[d] === g)) {
                e = n[d];
                continue;
              }
              if (h[d] >= 0) {
                (y = w - d), d === 0 && (y = 1);
                do
                  if (((d -= y) < 0 && (d += w), h[d] === g)) {
                    e = n[d];
                    continue a;
                  }
                while (h[d] >= 0);
              }
              l(e, r), (e = t), k < 1 << b ? ((n[d] = k++), (h[d] = g)) : x(r);
            }
            l(e, r), l(o, r);
          }
          function z(a) {
            a.writeByte(s),
              (remaining = y * D),
              (curPixel = 0),
              A(s + 1, a),
              a.writeByte(0);
          }
          function t(a) {
            f > 0 && (a.writeByte(f), a.writeBytes(r, 0, f), (f = 0));
          }
          function p(a) {
            return (1 << a) - 1;
          }
          function v() {
            if (remaining === 0) return c;
            --remaining;
            var a = C[curPixel++];
            return a & 255;
          }
          function l(a, c) {
            (g &= d[e]), e > 0 ? (g |= a << e) : (g = a), (e += n_bits);
            while (e >= 8) w(g & 255, c), (g >>= 8), (e -= 8);
            if (
              ((k > m || j) &&
                (j
                  ? ((m = p((n_bits = q))), (j = !1))
                  : (++n_bits, n_bits == b ? (m = 1 << b) : (m = p(n_bits)))),
              a == o)
            ) {
              while (e > 0) w(g & 255, c), (g >>= 8), (e -= 8);
              t(c);
            }
          }
          var s = Math.max(2, B),
            r = new Uint8Array(256),
            h = new Int32Array(a),
            n = new Int32Array(a),
            g,
            e = 0,
            f,
            k = 0,
            m,
            j = !1,
            q,
            i,
            o;
          this.encode = z;
        }
        var c = -1,
          b = 12,
          a = 5003,
          d = [
            0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191,
            16383, 32767, 65535,
          ];
        e.exports = f;
      }),
      a.define("/TypedNeuQuant.js", function (A, F, E, D) {
        function C(A, B) {
          function I() {
            (o = []),
              (q = new Int32Array(256)),
              (t = new Int32Array(a)),
              (y = new Int32Array(a)),
              (z = new Int32Array(a >> 3));
            var c, d;
            for (c = 0; c < a; c++)
              (d = (c << (b + 8)) / a),
                (o[c] = new Float64Array([d, d, d, 0])),
                (y[c] = e / a),
                (t[c] = 0);
          }
          function J() {
            for (var c = 0; c < a; c++)
              (o[c][0] >>= b), (o[c][1] >>= b), (o[c][2] >>= b), (o[c][3] = c);
          }
          function K(b, a, c, e, f) {
            (o[a][0] -= (b * (o[a][0] - c)) / d),
              (o[a][1] -= (b * (o[a][1] - e)) / d),
              (o[a][2] -= (b * (o[a][2] - f)) / d);
          }
          function L(j, e, n, l, k) {
            var h = Math.abs(e - j),
              i = Math.min(e + j, a),
              g = e + 1,
              f = e - 1,
              m = 1,
              b,
              d;
            while (g < i || f > h)
              (d = z[m++]),
                g < i &&
                  ((b = o[g++]),
                  (b[0] -= (d * (b[0] - n)) / c),
                  (b[1] -= (d * (b[1] - l)) / c),
                  (b[2] -= (d * (b[2] - k)) / c)),
                f > h &&
                  ((b = o[f--]),
                  (b[0] -= (d * (b[0] - n)) / c),
                  (b[1] -= (d * (b[1] - l)) / c),
                  (b[2] -= (d * (b[2] - k)) / c));
          }
          function C(p, s, q) {
            var h = 2147483647,
              k = h,
              d = -1,
              m = d,
              c,
              j,
              e,
              n,
              l;
            for (c = 0; c < a; c++)
              (j = o[c]),
                (e =
                  Math.abs(j[0] - p) + Math.abs(j[1] - s) + Math.abs(j[2] - q)),
                e < h && ((h = e), (d = c)),
                (n = e - (t[c] >> (i - b))),
                n < k && ((k = n), (m = c)),
                (l = y[c] >> g),
                (y[c] -= l),
                (t[c] += l << f);
            return (y[d] += x), (t[d] -= r), m;
          }
          function D() {
            var d,
              b,
              e,
              c,
              h,
              g,
              f = 0,
              i = 0;
            for (d = 0; d < a; d++) {
              for (e = o[d], h = d, g = e[1], b = d + 1; b < a; b++)
                (c = o[b]), c[1] < g && ((h = b), (g = c[1]));
              if (
                ((c = o[h]),
                d != h &&
                  ((b = c[0]),
                  (c[0] = e[0]),
                  (e[0] = b),
                  (b = c[1]),
                  (c[1] = e[1]),
                  (e[1] = b),
                  (b = c[2]),
                  (c[2] = e[2]),
                  (e[2] = b),
                  (b = c[3]),
                  (c[3] = e[3]),
                  (e[3] = b)),
                g != f)
              ) {
                for (q[f] = (i + d) >> 1, b = f + 1; b < g; b++) q[b] = d;
                (f = g), (i = d);
              }
            }
            for (q[f] = (i + n) >> 1, b = f + 1; b < 256; b++) q[b] = n;
          }
          function E(j, i, k) {
            var b,
              d,
              c,
              e = 1e3,
              h = -1,
              f = q[i],
              g = f - 1;
            while (f < a || g >= 0)
              f < a &&
                ((d = o[f]),
                (c = d[1] - i),
                c >= e
                  ? (f = a)
                  : (f++,
                    c < 0 && (c = -c),
                    (b = d[0] - j),
                    b < 0 && (b = -b),
                    (c += b),
                    c < e &&
                      ((b = d[2] - k),
                      b < 0 && (b = -b),
                      (c += b),
                      c < e && ((e = c), (h = d[3]))))),
                g >= 0 &&
                  ((d = o[g]),
                  (c = i - d[1]),
                  c >= e
                    ? (g = -1)
                    : (g--,
                      c < 0 && (c = -c),
                      (b = d[0] - j),
                      b < 0 && (b = -b),
                      (c += b),
                      c < e &&
                        ((b = d[2] - k),
                        b < 0 && (b = -b),
                        (c += b),
                        c < e && ((e = c), (h = d[3])))));
            return h;
          }
          function F() {
            var c,
              f = A.length,
              D = 30 + (B - 1) / 3,
              y = f / (3 * B),
              q = ~~(y / w),
              n = d,
              o = u,
              a = o >> h;
            for (a <= 1 && (a = 0), c = 0; c < a; c++)
              z[c] = n * (((a * a - c * c) * m) / (a * a));
            var i;
            f < s
              ? ((B = 1), (i = 3))
              : f % l !== 0
              ? (i = 3 * l)
              : f % k !== 0
              ? (i = 3 * k)
              : f % p !== 0
              ? (i = 3 * p)
              : (i = 3 * j);
            var r,
              t,
              x,
              e,
              g = 0;
            c = 0;
            while (c < y)
              if (
                ((r = (A[g] & 255) << b),
                (t = (A[g + 1] & 255) << b),
                (x = (A[g + 2] & 255) << b),
                (e = C(r, t, x)),
                K(n, e, r, t, x),
                a !== 0 && L(a, e, r, t, x),
                (g += i),
                g >= f && (g -= f),
                c++,
                q === 0 && (q = 1),
                c % q === 0)
              )
                for (
                  n -= n / D, o -= o / v, a = o >> h, a <= 1 && (a = 0), e = 0;
                  e < a;
                  e++
                )
                  z[e] = n * (((a * a - e * e) * m) / (a * a));
          }
          function G() {
            I(), F(), J(), D();
          }
          function H() {
            var b = [],
              g = [];
            for (var c = 0; c < a; c++) g[o[c][3]] = c;
            var d = 0;
            for (var e = 0; e < a; e++) {
              var f = g[e];
              (b[d++] = o[f][0]), (b[d++] = o[f][1]), (b[d++] = o[f][2]);
            }
            return b;
          }
          var o, q, t, y, z;
          (this.buildColormap = G),
            (this.getColormap = H),
            (this.lookupRGB = E);
        }
        var w = 100,
          a = 256,
          n = a - 1,
          b = 4,
          i = 16,
          e = 1 << i,
          f = 10,
          B = 1 << f,
          g = 10,
          x = e >> g,
          r = e << (f - g),
          z = a >> 3,
          h = 6,
          t = 1 << h,
          u = z * t,
          v = 30,
          o = 10,
          d = 1 << o,
          q = 8,
          m = 1 << q,
          y = o + q,
          c = 1 << y,
          l = 499,
          k = 491,
          p = 487,
          j = 503,
          s = 3 * j;
        A.exports = C;
      }),
      a("/gif.worker.coffee");
  }.call(this, this));
}
