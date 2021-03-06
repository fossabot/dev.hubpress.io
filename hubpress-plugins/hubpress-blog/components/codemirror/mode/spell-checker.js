/**
 * codemirror-spell-checker v1.0.6
 * Copyright Next Step Webs, Inc.
 * @link https://github.com/NextStepWebs/codemirror-spell-checker
 * @license MIT
 */

;(function(mod) {
  if (typeof exports == 'object' && typeof module == 'object') {
    // CommonJS
    mod(require('codemirror'))
  } else if (typeof brackets == 'object' && brackets.getModule) {
    // Brackets editor (using this as a client-side module!)
    mod(brackets.getModule('thirdparty/CodeMirror2/lib/codemirror'))
  } else if (typeof define == 'function' && define.amd) {
    // AMD
    define(['codemirror'], mod)
  } else {
    // Plain browser env
    mod(CodeMirror)
  }
})(function(CodeMirror) {
  'use strict'
  var Typo = function(e, t, r, n) {
    if (
      (
        (n = n || {}),
        (this.platform = n.platform || 'chrome'),
        (this.dictionary = null),
        (this.rules = {}),
        (this.dictionaryTable = {}),
        (this.compoundRules = []),
        (this.compoundRuleCodes = {}),
        (this.replacementTable = []),
        (this.flags = n.flags || {}),
        e
      )
    ) {
      if (((this.dictionary = e), 'chrome' == this.platform))
        t ||
          (t = this._readFile(
            chrome.extension.getURL(
              'lib/typo/dictionaries/' + e + '/' + e + '.aff',
            ),
          )), r ||
          (r = this._readFile(
            chrome.extension.getURL(
              'lib/typo/dictionaries/' + e + '/' + e + '.dic',
            ),
          ))
      else {
        var i = n.dictionaryPath || ''
        t || (t = this._readFile(i + '/' + e + '/' + e + '.aff')), r ||
          (r = this._readFile(i + '/' + e + '/' + e + '.dic'))
      }
      ;(this.rules = this._parseAFF(t)), (this.compoundRuleCodes = {})
      for (var a = 0, s = this.compoundRules.length; s > a; a++)
        for (var o = this.compoundRules[a], l = 0, u = o.length; u > l; l++)
          this.compoundRuleCodes[o[l]] = []
      'ONLYINCOMPOUND' in this.flags &&
        (this.compoundRuleCodes[
          this.flags.ONLYINCOMPOUND
        ] = []), (this.dictionaryTable = this._parseDIC(r))
      for (var a in this.compoundRuleCodes)
        0 == this.compoundRuleCodes[a].length &&
          delete this.compoundRuleCodes[a]
      for (var a = 0, s = this.compoundRules.length; s > a; a++) {
        for (
          var h = this.compoundRules[a], c = '', l = 0, u = h.length;
          u > l;
          l++
        ) {
          var p = h[l]
          c +=
            p in this.compoundRuleCodes
              ? '(' + this.compoundRuleCodes[p].join('|') + ')'
              : p
        }
        this.compoundRules[a] = new RegExp(c, 'i')
      }
    }
    return this
  }
  Typo.prototype = {
    load: function(e) {
      for (var t in e) this[t] = e[t]
      return this
    },
    _readFile: function(e, t) {
      t || (t = 'ISO8859-1')
      var r = new XMLHttpRequest()
      return r.open('GET', e, !1), r.overrideMimeType &&
        r.overrideMimeType('text/plain; charset=' + t), r.send(
        null,
      ), r.responseText
    },
    _parseAFF: function(e) {
      var t = {}
      e = this._removeAffixComments(e)
      for (var r = e.split('\n'), n = 0, i = r.length; i > n; n++) {
        var a = r[n],
          s = a.split(/\s+/),
          o = s[0]
        if ('PFX' == o || 'SFX' == o) {
          for (
            var l = s[1],
              u = s[2],
              h = parseInt(s[3], 10),
              c = [],
              p = n + 1,
              f = n + 1 + h;
            f > p;
            p++
          ) {
            var a = r[p],
              d = a.split(/\s+/),
              v = d[2],
              g = d[3].split('/'),
              m = g[0]
            '0' === m && (m = '')
            var y = this.parseRuleCodes(g[1]),
              _ = d[4],
              C = {}
            ;(C.add = m), y.length > 0 && (C.continuationClasses = y), '.' !==
              _ &&
              ('SFX' === o
                ? (C.match = new RegExp(_ + '$'))
                : (C.match = new RegExp('^' + _))), '0' != v &&
              ('SFX' === o
                ? (C.remove = new RegExp(v + '$'))
                : (C.remove = v)), c.push(C)
          }
          ;(t[l] = { type: o, combineable: 'Y' == u, entries: c }), (n += h)
        } else if ('COMPOUNDRULE' === o) {
          for (
            var h = parseInt(s[1], 10), p = n + 1, f = n + 1 + h;
            f > p;
            p++
          ) {
            var a = r[p],
              d = a.split(/\s+/)
            this.compoundRules.push(d[1])
          }
          n += h
        } else if ('REP' === o) {
          var d = a.split(/\s+/)
          3 === d.length && this.replacementTable.push([d[1], d[2]])
        } else this.flags[o] = s[1]
      }
      return t
    },
    _removeAffixComments: function(e) {
      return (e = e.replace(/#.*$/gm, '')), (e = e
        .replace(/^\s\s*/m, '')
        .replace(/\s\s*$/m, '')), (e = e.replace(
        /\n{2,}/g,
        '\n',
      )), (e = e.replace(/^\s\s*/, '').replace(/\s\s*$/, ''))
    },
    _parseDIC: function(e) {
      function t(e, t) {
        ;(e in n && 'object' == typeof n[e]) || (n[e] = []), n[e].push(t)
      }
      e = this._removeDicComments(e)
      for (var r = e.split('\n'), n = {}, i = 1, a = r.length; a > i; i++) {
        var s = r[i],
          o = s.split('/', 2),
          l = o[0]
        if (o.length > 1) {
          var u = this.parseRuleCodes(o[1])
          ;('NEEDAFFIX' in this.flags &&
            -1 != u.indexOf(this.flags.NEEDAFFIX)) ||
            t(l, u)
          for (var h = 0, c = u.length; c > h; h++) {
            var p = u[h],
              f = this.rules[p]
            if (f)
              for (
                var d = this._applyRule(l, f), v = 0, g = d.length;
                g > v;
                v++
              ) {
                var m = d[v]
                if ((t(m, []), f.combineable))
                  for (var y = h + 1; c > y; y++) {
                    var _ = u[y],
                      C = this.rules[_]
                    if (C && C.combineable && f.type != C.type)
                      for (
                        var R = this._applyRule(m, C), b = 0, F = R.length;
                        F > b;
                        b++
                      ) {
                        var x = R[b]
                        t(x, [])
                      }
                  }
              }
            p in this.compoundRuleCodes && this.compoundRuleCodes[p].push(l)
          }
        } else t(l.trim(), [])
      }
      return n
    },
    _removeDicComments: function(e) {
      return (e = e.replace(/^\t.*$/gm, ''))
    },
    parseRuleCodes: function(e) {
      if (!e) return []
      if (!('FLAG' in this.flags)) return e.split('')
      if ('long' === this.flags.FLAG) {
        for (var t = [], r = 0, n = e.length; n > r; r += 2)
          t.push(e.substr(r, 2))
        return t
      }
      return 'num' === this.flags.FLAG ? textCode.split(',') : void 0
    },
    _applyRule: function(e, t) {
      for (var r = t.entries, n = [], i = 0, a = r.length; a > i; i++) {
        var s = r[i]
        if (!s.match || e.match(s.match)) {
          var o = e
          if (
            (
              s.remove && (o = o.replace(s.remove, '')),
              'SFX' === t.type ? (o += s.add) : (o = s.add + o),
              n.push(o),
              'continuationClasses' in s
            )
          )
            for (var l = 0, u = s.continuationClasses.length; u > l; l++) {
              var h = this.rules[s.continuationClasses[l]]
              h && (n = n.concat(this._applyRule(o, h)))
            }
        }
      }
      return n
    },
    check: function(e) {
      var t = e.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
      if (this.checkExact(t)) return !0
      if (t.toUpperCase() === t) {
        var r = t[0] + t.substring(1).toLowerCase()
        if (this.hasFlag(r, 'KEEPCASE')) return !1
        if (this.checkExact(r)) return !0
      }
      var n = t.toLowerCase()
      if (n !== t) {
        if (this.hasFlag(n, 'KEEPCASE')) return !1
        if (this.checkExact(n)) return !0
      }
      return !1
    },
    checkExact: function(e) {
      var t = this.dictionaryTable[e]
      if ('undefined' == typeof t) {
        if ('COMPOUNDMIN' in this.flags && e.length >= this.flags.COMPOUNDMIN)
          for (var r = 0, n = this.compoundRules.length; n > r; r++)
            if (e.match(this.compoundRules[r])) return !0
        return !1
      }
      for (var r = 0, n = t.length; n > r; r++)
        if (!this.hasFlag(e, 'ONLYINCOMPOUND', t[r])) return !0
      return !1
    },
    hasFlag: function(e, t, r) {
      if (t in this.flags) {
        if ('undefined' == typeof r)
          var r = Array.prototype.concat.apply([], this.dictionaryTable[e])
        if (r && -1 !== r.indexOf(this.flags[t])) return !0
      }
      return !1
    },
    alphabet: '',
    suggest: function(e, t) {
      function r(e) {
        for (var t = [], r = 0, n = e.length; n > r; r++) {
          for (var i = e[r], a = [], s = 0, o = i.length + 1; o > s; s++)
            a.push([i.substring(0, s), i.substring(s, i.length)])
          for (var l = [], s = 0, o = a.length; o > s; s++) {
            var h = a[s]
            h[1] && l.push(h[0] + h[1].substring(1))
          }
          for (var c = [], s = 0, o = a.length; o > s; s++) {
            var h = a[s]
            h[1].length > 1 &&
              c.push(h[0] + h[1][1] + h[1][0] + h[1].substring(2))
          }
          for (var p = [], s = 0, o = a.length; o > s; s++) {
            var h = a[s]
            if (h[1])
              for (var f = 0, d = u.alphabet.length; d > f; f++)
                p.push(h[0] + u.alphabet[f] + h[1].substring(1))
          }
          for (var v = [], s = 0, o = a.length; o > s; s++) {
            var h = a[s]
            if (h[1])
              for (var f = 0, d = u.alphabet.length; d > f; f++)
                p.push(h[0] + u.alphabet[f] + h[1])
          }
          ;(t = t.concat(l)), (t = t.concat(c)), (t = t.concat(
            p,
          )), (t = t.concat(v))
        }
        return t
      }
      function n(e) {
        for (var t = [], r = 0; r < e.length; r++) u.check(e[r]) && t.push(e[r])
        return t
      }
      function i(e) {
        function i(e, t) {
          return e[1] < t[1] ? -1 : 1
        }
        for (
          var a = r([e]),
            s = r(a),
            o = n(a).concat(n(s)),
            l = {},
            h = 0,
            c = o.length;
          c > h;
          h++
        )
          o[h] in l ? (l[o[h]] += 1) : (l[o[h]] = 1)
        var p = []
        for (var h in l) p.push([h, l[h]])
        p.sort(i).reverse()
        for (var f = [], h = 0, c = Math.min(t, p.length); c > h; h++)
          u.hasFlag(p[h][0], 'NOSUGGEST') || f.push(p[h][0])
        return f
      }
      if ((t || (t = 5), this.check(e))) return []
      for (var a = 0, s = this.replacementTable.length; s > a; a++) {
        var o = this.replacementTable[a]
        if (-1 !== e.indexOf(o[0])) {
          var l = e.replace(o[0], o[1])
          if (this.check(l)) return [l]
        }
      }
      var u = this
      return (u.alphabet = 'abcdefghijklmnopqrstuvwxyz'), i(e)
    },
  }
  var num_loaded = 0,
    aff_loading = !1,
    dic_loading = !1,
    aff_data = '',
    dic_data = '',
    typo
  CodeMirror.defineMode('spell-checker', function(e, t) {
    if (!aff_loading) {
      aff_loading = !0
      var r = new XMLHttpRequest()
      r.open(
        'GET',
        'https://cdn.jsdelivr.net/codemirror.spell-checker/latest/en_US.aff',
        !0,
      ), (r.onload = function(e) {
        4 === r.readyState &&
          200 === r.status &&
          (
            (aff_data = r.responseText),
            num_loaded++,
            2 == num_loaded &&
              (typo = new Typo('en_US', aff_data, dic_data, {
                platform: 'any',
              }))
          )
      }), r.send(null)
    }
    if (!dic_loading) {
      dic_loading = !0
      var n = new XMLHttpRequest()
      n.open(
        'GET',
        'https://cdn.jsdelivr.net/codemirror.spell-checker/latest/en_US.dic',
        !0,
      ), (n.onload = function(e) {
        4 === n.readyState &&
          200 === n.status &&
          (
            (dic_data = n.responseText),
            num_loaded++,
            2 == num_loaded &&
              (typo = new Typo('en_US', aff_data, dic_data, {
                platform: 'any',
              }))
          )
      }), n.send(null)
    }
    var i = '!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~ ',
      a = {
        token: function(e, t) {
          var r = e.peek(),
            n = ''
          if (i.includes(r)) return e.next(), null
          for (; null != (r = e.peek()) && !i.includes(r); ) (n += r), e.next()
          return typo && !typo.check(n) ? 'spell-error' : null
        },
      },
      s = CodeMirror.getMode(e, e.backdrop || 'text/plain')
    return CodeMirror.overlayMode(s, a, !0)
  }), String.prototype.includes ||
    (String.prototype.includes = function() {
      return -1 !== String.prototype.indexOf.apply(this, arguments)
    })
})
