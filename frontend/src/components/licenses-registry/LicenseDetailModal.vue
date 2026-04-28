<script setup lang="ts">
import { ref } from 'vue'
import { fmt, type LicenseUI } from './registry'
import KindBadge from './KindBadge.vue'
import StatusBadge from './StatusBadge.vue'
import ExpiryMeter from './ExpiryMeter.vue'
import { publicLicensesApi } from '../../api/licenses'

const props = defineProps<{ lic: LicenseUI; today: Date }>()
defineEmits<{ (e: 'close'): void }>()

const downloading = ref(false)
const downloadError = ref('')

async function download() {
  if (!props.lic.hasDocument) return
  downloading.value = true
  downloadError.value = ''
  try {
    const blob = await publicLicensesApi.downloadDocumentByNumber(props.lic.num)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.lic.num}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    downloadError.value = 'Не удалось скачать документ'
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal__body" @click.stop>
      <div class="modal__head">
        <div
          class="modal__kind"
          :style="{
            background: `linear-gradient(135deg, oklch(62% 0.14 ${lic.kindMeta.hue}), oklch(48% 0.14 ${lic.kindMeta.hue}))`,
            boxShadow: `0 10px 30px -8px oklch(60% 0.14 ${lic.kindMeta.hue} / 0.5)`,
          }"
        >
          {{ lic.kindMeta.short }}
        </div>
        <div class="modal__head-main">
          <div class="mono modal__num">№ {{ lic.num }} · ИНН {{ lic.inn }}</div>
          <h2 class="modal__title">{{ lic.org }}</h2>
          <div class="modal__chips">
            <KindBadge :kind="lic.kind" />
            <StatusBadge :status="lic.status" />
            <span class="modal__region-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 21s-7-6-7-12a7 7 0 1114 0c0 6-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {{ lic.region }}
            </span>
          </div>
        </div>
        <button class="modal__close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div class="modal__grid">
        <div>
          <div class="section-title">Срок действия</div>
          <div class="modal__meter">
            <ExpiryMeter :lic="lic" :today="today" />
          </div>

          <div class="section-title section-title--mt">Реквизиты</div>
          <dl class="dl">
            <div>
              <dt>Юридический адрес</dt>
              <dd>{{ lic.address }}</dd>
            </div>
            <div>
              <dt>Регион деятельности</dt>
              <dd>{{ lic.region }}</dd>
            </div>
            <div>
              <dt>Выдана</dt>
              <dd class="mono">{{ fmt(lic.issued) }}</dd>
            </div>
            <div>
              <dt>Действует до</dt>
              <dd class="mono">{{ fmt(lic.expires) }}</dd>
            </div>
            <div v-if="lic.issuedByName">
              <dt>Кем выдана</dt>
              <dd>{{ lic.issuedByName }}</dd>
            </div>
            <div v-if="lic.isRevoked">
              <dt>Статус</dt>
              <dd style="color: var(--lr-rose)">Отозвана</dd>
            </div>
          </dl>
        </div>

        <div>
          <div class="section-title">Проверка подлинности</div>
          <div class="modal__qr-box">
            <svg width="140" height="140" viewBox="0 0 140 140" class="modal__qr">
              <rect width="140" height="140" fill="#fff" />
              <g>
                <rect x="0" y="0" width="46.67" height="46.67" fill="#0C1713" />
                <rect x="6.67" y="6.67" width="33.33" height="33.33" fill="#fff" />
                <rect x="13.33" y="13.33" width="20" height="20" fill="#0C1713" />
                <rect x="93.33" y="0" width="46.67" height="46.67" fill="#0C1713" />
                <rect x="100" y="6.67" width="33.33" height="33.33" fill="#fff" />
                <rect x="106.67" y="13.33" width="20" height="20" fill="#0C1713" />
                <rect x="0" y="93.33" width="46.67" height="46.67" fill="#0C1713" />
                <rect x="6.67" y="100" width="33.33" height="33.33" fill="#fff" />
                <rect x="13.33" y="106.67" width="20" height="20" fill="#0C1713" />
              </g>
              <g fill="#0C1713">
                <rect x="60" y="10" width="6.67" height="6.67" />
                <rect x="73.33" y="10" width="6.67" height="6.67" />
                <rect x="60" y="23.33" width="6.67" height="6.67" />
                <rect x="53.33" y="40" width="6.67" height="6.67" />
                <rect x="66.67" y="40" width="6.67" height="6.67" />
                <rect x="80" y="40" width="6.67" height="6.67" />
                <rect x="60" y="53.33" width="6.67" height="6.67" />
                <rect x="73.33" y="53.33" width="6.67" height="6.67" />
                <rect x="86.67" y="53.33" width="6.67" height="6.67" />
                <rect x="53.33" y="66.67" width="6.67" height="6.67" />
                <rect x="73.33" y="66.67" width="6.67" height="6.67" />
                <rect x="93.33" y="66.67" width="6.67" height="6.67" />
                <rect x="60" y="80" width="6.67" height="6.67" />
                <rect x="80" y="80" width="6.67" height="6.67" />
                <rect x="100" y="80" width="6.67" height="6.67" />
                <rect x="66.67" y="93.33" width="6.67" height="6.67" />
                <rect x="86.67" y="93.33" width="6.67" height="6.67" />
                <rect x="106.67" y="93.33" width="6.67" height="6.67" />
                <rect x="53.33" y="106.67" width="6.67" height="6.67" />
                <rect x="73.33" y="106.67" width="6.67" height="6.67" />
                <rect x="93.33" y="106.67" width="6.67" height="6.67" />
                <rect x="113.33" y="106.67" width="6.67" height="6.67" />
              </g>
            </svg>
            <div class="modal__qr-hint">
              Отсканируйте для проверки подлинности в реестре<br />
              <span class="mono">reestr.kg/v/{{ lic.num }}</span>
            </div>
          </div>

          <div class="section-title section-title--mt">Документы</div>
          <div class="modal__docs">
            <button
              class="doc-row"
              :disabled="!lic.hasDocument || downloading"
              @click="download"
            >
              <div class="doc-row__ext">PDF</div>
              <div class="doc-row__info">
                <div class="doc-row__label">Бланк лицензии</div>
                <div class="doc-row__size">
                  <template v-if="!lic.hasDocument">Документ ещё не загружен</template>
                  <template v-else-if="downloading">Скачивание…</template>
                  <template v-else>Подписанный PDF</template>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v13M6 12l6 5 6-5M4 21h16" />
              </svg>
            </button>
            <div v-if="downloadError" class="modal__error">{{ downloadError }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(12, 23, 19, 0.45);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 24px;
}
.modal__body {
  width: min(920px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.3);
}
.modal__head {
  padding: 28px 32px;
  border-bottom: 1px solid var(--lr-line);
  display: flex;
  align-items: flex-start;
  gap: 24px;
}
.modal__kind {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  flex-shrink: 0;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 32px;
  font-weight: 700;
}
.modal__head-main {
  flex: 1;
  min-width: 0;
}
.modal__num {
  font-size: 12px;
  color: var(--lr-ink-4);
  font-weight: 600;
  letter-spacing: 0.4px;
}
.modal__title {
  margin: 6px 0 10px;
  font-size: 28px;
  letter-spacing: -0.5px;
}
.modal__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.modal__region-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  background: var(--lr-line-2);
  color: var(--lr-ink-2);
  font-size: 12px;
  font-weight: 500;
}
.modal__close {
  border: none;
  background: var(--lr-line-2);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  display: grid;
  place-items: center;
}
.modal__grid {
  padding: 24px 32px 32px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 32px;
}
.section-title {
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--lr-ink-4);
  font-weight: 600;
  margin-bottom: 10px;
}
.section-title--mt {
  margin-top: 24px;
}
.modal__meter {
  padding: 20px;
  border: 1px solid var(--lr-line);
  border-radius: 14px;
  background: var(--lr-brand-025);
}
.dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  margin: 0;
}
.dl > div {
  min-width: 0;
}
.dl dt {
  font-size: 11px;
  color: var(--lr-ink-4);
  margin-bottom: 3px;
  font-weight: 500;
}
.dl dd {
  margin: 0;
  font-size: 14px;
  color: var(--lr-ink);
  font-weight: 500;
}
.modal__qr-box {
  padding: 20px;
  border: 1px solid var(--lr-line);
  border-radius: 14px;
  background: #fff;
  text-align: center;
}
.modal__qr {
  display: block;
  margin: 0 auto;
}
.modal__qr-hint {
  font-size: 12px;
  color: var(--lr-ink-3);
  margin-top: 12px;
  line-height: 1.5;
}
.modal__docs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.doc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--lr-line);
  border-radius: 10px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
  color: inherit;
}
.doc-row:hover:not(:disabled) {
  border-color: var(--lr-brand);
  background: var(--lr-brand-025);
}
.doc-row:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.doc-row__ext {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--lr-brand-050);
  color: var(--lr-brand-700);
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.doc-row__info {
  flex: 1;
}
.doc-row__label {
  font-size: 13px;
  font-weight: 500;
}
.doc-row__size {
  font-size: 11px;
  color: var(--lr-ink-4);
}
.modal__error {
  color: var(--lr-rose);
  font-size: 12px;
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
@media (max-width: 700px) {
  .modal__grid {
    grid-template-columns: 1fr;
  }
  .modal__title {
    font-size: 22px;
  }
}
</style>
