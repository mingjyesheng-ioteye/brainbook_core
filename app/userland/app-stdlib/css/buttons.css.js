import {css} from 'lit'
import resetcss from './reset.css.js'
import colorscss from './colors.css.js'
const cssStr = css`
${resetcss}
${colorscss}

.link {
  color: var(--blue);
}

.link:hover {
  text-decoration: underline;
}

.btn.nofocus,
.btn[disabled="disabled"],
.btn.disabled,
.btn:disabled {
  outline: 0;
  box-shadow: none;
}

.btn {
  display: inline-block;
  height: 30px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 2px;
  color: var(--text-color--default);
  font-size: 13px;
  line-height: 26px;
  letter-spacing: 0.25px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: none;
}

.btn.small {
  height: 24px;
  line-height: 20px;
}

.btn.small * {
  vertical-align: top;
  line-height: 20px;
}

.btn.plain {
  background: none;
  border: none;
  color: var(--text-color--pretty-light);
  line-height: 28px;
  padding: 0 3px;
}

.btn.plain:hover {
  color: var(--text-color--default);
  background: none;
}

.btn.plain:focus {
  box-shadow: none;
}

.btn i {
  line-height: 100%;
  line-height: 30px;
  vertical-align: middle;
}

.btn i:last-child {
  margin-left: 2px;
  margin-right: 0;
}

.btn i:first-child {
  margin-left: 0;
  margin-right: 2px;
}

.btn i:first-child:last-child {
  margin-left: 0;
  margin-right: 0;
}

.btn:focus {
  outline: none;
}

.btn.full-width {
  width: 100%;
}

.btn.center {
  text-align: center;
}

.btn.thick {
  font-size: 14px;
  font-weight: normal;
  height: 35px;
  line-height: 32px;
  padding: 0 12px;
}

.btn.pressed {
  box-shadow: inset 0px 0 5px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to top, #ddd, #ccc);
}

.btn.pressed:hover {
  box-shadow: inset 0px 0 2px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to top, #ddd, #ccc);
  cursor: default;
}

.btn:hover {
  text-decoration: none;
  background: #eee;
}

.btn[disabled="disabled"],
.btn.disabled,
.btn:disabled {
  cursor: default !important;
  background: #fafafa !important;
  color: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid #eee !important;
  font-weight: 400 !important;
  -webkit-font-smoothing: initial !important;
}

.btn[disabled="disabled"] .spinner,
.btn.disabled .spinner,
.btn:disabled .spinner {
  color: #aaa !important;
}

.btn[disabled="disabled"]:hover,
.btn.disabled:hover,
.btn:disabled:hover {
  background: #fafafa;
}

.btn[disabled="disabled"] *,
.btn.disabled *,
.btn:disabled * {
  cursor: default !important;
}

.btn .spinner {
  display: inline-block;
  position: relative;
  top: 1px;
  color: inherit;
}

.btn.warning {
  color: #fff;
  background: #cc2f26;
  border-color: #cc2f26;
}

.btn.warning.pressed,
.btn.warning:hover {
  background: #c42d25;
  border-color: #c42d25;
}

.btn.success {
  background: #41bb56;
  color: #fff;
  border-color: #41bb56;
}

.btn.success.pressed,
.btn.success:hover {
  background: #3baa4e;
  border-color: #3baa4e;
}

.btn.transparent {
  border-color: transparent;
  background: none;
  font-weight: 400;
}

.btn.transparent:hover {
  background: rgba(0, 0, 0, 0.075);
  color: #424242;
}

.btn.transparent.disabled {
  border-color: transparent !important;
  background: none !important;
}

.btn.transparent.pressed {
  background: linear-gradient(to top, #f5f3f3, #ececec);
  border-color: #dadada;
}

.btn.primary {
  background: #2864dc;
  color: #fff;
  border: 1px solid #2864dc;
  transition: background 0.1s ease;
}

.btn.primary.pressed {
  box-shadow: inset 0px 0 5px rgba(0, 0, 0, 0.25);
}

.btn.primary:hover {
  background: #2357bf;
}

.btn.nofocus:focus,
button.nofocus:focus {
  outline: 0;
  box-shadow: none;
}

`
export default cssStr
