/**
 * Stylesheet of the settings page. Class names carry the package prefix because
 * this sheet is global by construction, not a CSS module.
 */

/** `data-plugin-css` marker of the page stylesheet. */
export const PAGE_STYLE_MARK = 'dsh-reduce-effects/page'

/** Page styles, sized to the DSH settings surface conventions. */
export const PAGE_CSS = `.dsh-reduce-effects-page {
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dsh-reduce-effects-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}

.dsh-reduce-effects-intro {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-tertiary);
}

.dsh-reduce-effects-card {
  background: var(--dsw-alias-bg-layer-3);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  padding: 0 16px;
}

.dsh-reduce-effects-cardTitle {
  padding: 12px 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}

.dsh-reduce-effects-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--dsw-alias-border-l2);
}

.dsh-reduce-effects-rowText {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 auto;
  min-width: 0;
}

.dsh-reduce-effects-rowLabel {
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
}

.dsh-reduce-effects-rowHint {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
}

.dsh-reduce-effects-switch {
  flex: 0 0 auto;
}

.dsh-reduce-effects-note {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
}

@media (max-width: 560px) {
  .dsh-reduce-effects-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
`
