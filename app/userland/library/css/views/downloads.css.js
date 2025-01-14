import {css,unsafeCSS} from 'lit'
import buttonsCSS from '../../../app-stdlib/css/buttons2.css.js'
import tooltipCSS from '../../../app-stdlib/css/tooltip.css.js'
import spinnerCSS from '../../../app-stdlib/css/com/spinner.css.js'

const cssStr = css`
${unsafeCSS(buttonsCSS)}
${unsafeCSS(tooltipCSS)}
${unsafeCSS(spinnerCSS)}

:host {
  display: block;
}

a {
  text-decoration: none;
}

a[href]:hover {
  text-decoration: underline;
}

.downloads {
  font-size: 13px;
  box-sizing: border-box;
}

.downloads .empty {
  font-size: 17px;
  letter-spacing: 0.75px;
  color: #667;
  padding: 28px 40px;
}

.download {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  color: inherit;
  border-bottom: 1px solid var(--border-color--light);
}

.download .title {
  flex: 1;
}

.download .title strong {
  margin-right: 10px;
}

.download .metadata {
  width: 300px;
}

.download .metadata progress {
  margin-right: 10px;
  width: 40px;
}

.download .metadata > *:not(:first-child) {
  margin-left: 5px;
}

.download .metadata > * {
  margin-right: 3px;
}

.download .controls {
  width: 80px;
  text-align: right;
}

.download .link {
  color: #2864dc;
  cursor: pointer;
}

.download .link:hover {
  text-decoration: underline;
}

`
export default cssStr