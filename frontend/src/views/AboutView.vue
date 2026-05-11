<script setup lang="ts">
// /about - v2: уточнения после первой итерации.
// Изменения относительно v1:
//   1. Hero side-panel: dot-grid → photo-card с цитатой из Закона КР №181 (ст. 7).
//   2. Между «Как работает» и «Для кого» добавлена editorial-quote секция (миссия АИС).
//   3. Audience cards: 4 правильные роли (МПРЭТН · Эко Оператор · Бизнес · Заявители на лицензию),
//      «Граждане» удалены.
//   4. Секция «Правовая основа» полностью удалена (есть отдельная страница /legal-base).
//   5. В секции 2 под потоком «Утильсбор» добавлена download-карточка с PDF формы декларации.
// Сохранено без изменений: framing в hero, структура секции 2, footer-glossary,
// CTA «Войти/Зарегистрироваться», палитра АИС, Inter only.

interface FlowStep {
  n: string
  title: string
  desc: string
}

interface AudienceCard {
  tone: 'teal' | 'green' | 'slate' | 'yellow'
  title: string
  subtitle: string
  desc: string
  icon: 'briefcase' | 'recycle' | 'shield' | 'network'
}

const utilsborSteps: FlowStep[] = [
  { n: '01', title: 'Регистрация',                desc: 'Через ЭСИ «Тундук» или вручную: данные тянутся из профиля' },
  { n: '02', title: 'Заполнение расчёта',         desc: 'Тип плательщика, период, 24 товарные группы и масса' },
  { n: '03', title: 'Расчёт суммы утильсбора',    desc: 'Автоматически по ставкам ПКМ КР №730 и нормативам ПКМ КР №322' },
  { n: '04', title: 'Оплата и отчётность',        desc: 'Платёж и подача отчёта о выполнении норматива переработки' },
]

const licenseSteps: FlowStep[] = [
  { n: '01', title: 'Регистрация',                desc: 'Как «заявитель на лицензию»' },
  { n: '02', title: 'Заполнение онлайн-заявки',   desc: 'Тип деятельности, мощности, виды отходов' },
  { n: '03', title: 'Прикрепление документов',    desc: 'Устав, выписки, сертификаты' },
  { n: '04', title: 'Рассмотрение МПРЭТН',        desc: 'Проверка пакета документов и принятие решения' },
  { n: '05', title: 'Получение лицензии',         desc: 'Электронный документ в личном кабинете' },
]

const audiences: AudienceCard[] = [
  {
    tone: 'slate',
    icon: 'shield',
    title: 'МПРЭТН КР',
    subtitle: 'Министерство природных ресурсов, экологии и технического надзора',
    desc: 'Контроль деклараций, рассмотрение заявок на лицензию, утверждение нормативов и анализ показателей.',
  },
  {
    tone: 'teal',
    icon: 'network',
    title: 'ГП «Эко Оператор»',
    subtitle: 'Государственное предприятие - администратор системы',
    desc: 'Администрирование утилизационного сбора, ведение реестров и работа с обращениями.',
  },
  {
    tone: 'green',
    icon: 'briefcase',
    title: 'Бизнес',
    subtitle: 'Производители и импортёры товаров - плательщики утилизационного сбора',
    desc: 'Расчёт и уплата утилизационного сбора по 24 товарным группам, подача деклараций и отчётов о выполнении нормативов утилизации.',
  },
  {
    tone: 'yellow',
    icon: 'recycle',
    title: 'Заявители на лицензию',
    subtitle: 'Полигоны · пункты приёма · переработчики отходов',
    desc: 'Подача онлайн-заявок на лицензию переработки, ведение реестра переработанных объёмов, регулярная отчётность.',
  },
]
</script>

<template>
  <div class="about-page">
    <!-- ============== HERO ============== -->
    <section class="about-hero">
      <div class="container-main">
        <div class="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div class="lg:col-span-7">
            <div class="eyebrow text-[#0e888d] mb-6 lg:mb-8">О портале · АИС «Эко Оператор»</div>

            <h1 class="h1-display mb-6 lg:mb-8">
              Цифровое сопровождение<br>
              утилизационного сбора<br>
              и&nbsp;лицензирования<br>
              переработчиков отходов
            </h1>

            <p class="lede mb-8 lg:mb-10">
              АИС администрирует утилизационный сбор по&nbsp;24&nbsp;товарным группам (ПКМ&nbsp;КР&nbsp;№322) и&nbsp;обеспечивает онлайн-подачу заявок на&nbsp;лицензию переработки отходов.
            </p>

          </div>

          <!-- Photo-card с цитатой из Закона КР №181 (ст. 7 - расширенная ответственность) -->
          <div class="lg:col-span-5">
            <figure class="hero-photo-card">
              <div class="hero-photo">
                <!--
                  Чтобы подложить реальное фото переработки/упаковки -
                  положите файл `recycling-hero.jpg` в `frontend/public/images/about/`
                  и раскомментируйте <img> ниже. Сейчас рисуется CSS-плейсхолдер
                  в брендовых цветах.
                -->
                <!--
                <img
                  :src="heroPhotoSrc"
                  alt="Прессованный пластик и картон на сортировочной линии переработки"
                  loading="lazy"
                />
                -->
                <div class="hero-photo-placeholder" aria-hidden="true">
                  <article class="newspaper">
                    <header class="newspaper-masthead">
                      <span class="newspaper-brand">
                        <span class="newspaper-brand-dot"></span>
                        АИС&nbsp;·&nbsp;Правовая&nbsp;база
                      </span>
                      <span>17.11.2008</span>
                    </header>

                    <div class="newspaper-eyebrow">Закон Кыргызской&nbsp;Республики</div>
                    <h4 class="newspaper-title">
                      Об&nbsp;отходах производства
                      и&nbsp;потребления
                    </h4>
                    <div class="newspaper-meta">
                      <span>Статья&nbsp;7</span>
                      <span class="newspaper-meta-sep"></span>
                      <span>№&nbsp;181-II</span>
                    </div>

                    <div class="newspaper-rule"></div>

                    <div class="newspaper-columns">
                      <p>
                        Производители и&nbsp;импортёры товаров несут расширенную ответственность за&nbsp;их&nbsp;утилизацию после утраты потребительских свойств. Утилизационный сбор уплачивается при&nbsp;ввозе товара на&nbsp;территорию Республики в&nbsp;порядке, установленном Правительством.
                      </p>
                      <p>
                        Размеры сбора и&nbsp;нормативы переработки утверждаются Правительством Кыргызской Республики. Контроль за&nbsp;исполнением осуществляет уполномоченный государственный орган в&nbsp;сфере охраны окружающей среды.
                      </p>
                    </div>
                  </article>
                </div>
                <div class="hero-photo-tag">
                  <span class="hero-photo-tag-dot"></span>
                  Правовая&nbsp;база
                </div>
              </div>

              <figcaption class="hero-quote">
                <div class="eyebrow text-[#0e888d] mb-4">Статья 7 · Закон КР №181</div>
                <blockquote class="hero-quote-text">
                  «Производители и&nbsp;импортёры товаров несут расширенную ответственность за&nbsp;их&nbsp;утилизацию после утраты потребительских свойств.»
                </blockquote>
                <div class="hero-quote-attribution">
                  Закон КР об&nbsp;отходах производства и&nbsp;потребления
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>

    <!-- ============== HOW IT WORKS - DUAL FLOW ============== -->
    <section class="about-section">
      <div class="container-main">
        <div class="section-head">
          <div class="eyebrow text-[#0e888d] mb-5">Как работает АИС</div>
          <h2 class="h2-display mb-5">Два потока, одна система</h2>
          <p class="section-lede">
            В&nbsp;АИС реализованы два независимых пользовательских сценария: расчёт и&nbsp;уплата утилизационного сбора и&nbsp;онлайн-получение лицензии на&nbsp;переработку отходов.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <!-- Колонка 1 - Утильсбор -->
          <div class="step-flow tone-teal">
            <div class="flex items-center gap-3 mb-5">
              <div class="flow-icon" style="background: #0e888d;">
                <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="4" y="6" width="16" height="14" rx="2" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  <path d="M8 10h8M8 13h5M8 17h3" />
                </svg>
              </div>
              <span class="pill pill-teal">Утильсбор</span>
            </div>

            <h3 class="flow-title">Подача расчёта утильсбора</h3>
            <p class="flow-audience">для производителей и&nbsp;импортёров</p>

            <ol class="timeline">
              <li v-for="step in utilsborSteps" :key="step.n" class="timeline-step">
                <div class="timeline-num">{{ step.n }}</div>
                <div class="step-title">{{ step.title }}</div>
                <div class="step-desc">{{ step.desc }}</div>
              </li>
            </ol>

            <router-link to="/login" class="link-arrow" style="--link:#0e888d;">
              Подробнее в&nbsp;личном кабинете
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </router-link>

            <!-- Встроенная download-секция: форма декларации (PDF) -->
            <a
              class="flow-download"
              href="/docs/laws/forma-deklaracii-instrukciya.pdf"
              target="_blank"
              download
            >
              <div class="flow-download-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                  <path d="M14 3v5h5" />
                  <path d="M12 18v-6" />
                  <path d="m9 15 3 3 3-3" />
                </svg>
              </div>
              <div class="flow-download-body">
                <div class="flow-download-title">Форма декларации и&nbsp;инструкция</div>
                <div class="flow-download-meta">
                  <span>PDF</span>
                  <span class="flow-download-dot"></span>
                  <span>181 КБ</span>
                </div>
              </div>
              <div class="flow-download-cta">
                <span>Скачать</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="m6 13 6 6 6-6" />
                </svg>
              </div>
            </a>
          </div>

          <!-- Колонка 2 - Лицензирование -->
          <div class="step-flow tone-green">
            <div class="flex items-center gap-3 mb-5">
              <div class="flow-icon" style="background: #2D8B4E;">
                <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M7 19H4.5a1.5 1.5 0 0 1-1.3-2.25l1.4-2.4" />
                  <path d="m4 8 1.7-2.9A2 2 0 0 1 7.5 4h3" />
                  <path d="M16.5 4.5 19 8l-3.5 1.5" />
                  <path d="M14 20.5 17 22l1.5-3" />
                  <path d="m20 14-1.7 2.9a2 2 0 0 1-1.7 1.1H13" />
                  <path d="M8 14 5 16l3 2.5" />
                </svg>
              </div>
              <span class="pill pill-green">Лицензирование</span>
            </div>

            <h3 class="flow-title">Заявка на&nbsp;лицензию</h3>
            <p class="flow-audience">для переработчиков отходов</p>

            <ol class="timeline">
              <li v-for="step in licenseSteps" :key="step.n" class="timeline-step">
                <div class="timeline-num">{{ step.n }}</div>
                <div class="step-title">{{ step.title }}</div>
                <div class="step-desc">{{ step.desc }}</div>
              </li>
            </ol>

            <router-link to="/login" class="link-arrow" style="--link:#2D8B4E;">
              Подробнее в&nbsp;личном кабинете
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ============== EDITORIAL QUOTE - миссия АИС ============== -->
    <section class="about-quote">
      <div class="container-main">
        <div class="quote-shell">
          <div class="eyebrow text-[#0e888d] mb-7">Миссия АИС</div>
          <blockquote class="quote-text">
            «Каждая тонна, прошедшая через переработку,&nbsp;- это закон, который работает.»
          </blockquote>
          <div class="quote-attribution">
            <span class="quote-rule"></span>
            миссия АИС «Эко&nbsp;Оператор»
          </div>
        </div>
      </div>
    </section>

    <!-- ============== AUDIENCES ============== -->
    <section class="about-section">
      <div class="container-main">
        <div class="section-head">
          <div class="eyebrow text-[#0e888d] mb-5">Для кого АИС</div>
          <h2 class="h2-display mb-5">Четыре роли в&nbsp;системе</h2>
          <p class="section-lede">
            АИС обслуживает регулятора, оператора, плательщиков утилизационного сбора и&nbsp;заявителей на&nbsp;лицензию переработки отходов.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          <div
            v-for="(card, i) in audiences"
            :key="i"
            :class="['audience-card', `tone-${card.tone}`]"
          >
            <div class="audience-icon">
              <svg v-if="card.icon === 'shield'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <svg v-else-if="card.icon === 'network'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="2.2" />
                <circle cx="5"  cy="5"  r="2" />
                <circle cx="19" cy="5"  r="2" />
                <circle cx="5"  cy="19" r="2" />
                <circle cx="19" cy="19" r="2" />
                <path d="m6.6 6.6 3.8 3.8M17.4 6.6l-3.8 3.8M6.6 17.4l3.8-3.8M17.4 17.4l-3.8-3.8" />
              </svg>
              <svg v-else-if="card.icon === 'briefcase'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M3 13h18" />
              </svg>
              <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M7 19H4.5a1.5 1.5 0 0 1-1.3-2.25l1.4-2.4" />
                <path d="m4 8 1.7-2.9A2 2 0 0 1 7.5 4h3" />
                <path d="M16.5 4.5 19 8l-3.5 1.5" />
                <path d="M14 20.5 17 22l1.5-3" />
                <path d="m20 14-1.7 2.9a2 2 0 0 1-1.7 1.1H13" />
                <path d="M8 14 5 16l3 2.5" />
              </svg>
            </div>
            <h3 class="audience-title">{{ card.title }}</h3>
            <p class="audience-subtitle">{{ card.subtitle }}</p>
            <p class="audience-desc">{{ card.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============== FOOTER - GLOSSARY ONLY ============== -->
    <section class="about-footer">
      <div class="container-main">
        <router-link to="/glossary" class="glossary-card group">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 lg:gap-5">
              <div class="glossary-icon">
                <svg class="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 class="glossary-title">Глоссарий</h3>
                <p class="glossary-desc">Сокращения и&nbsp;условные обозначения, используемые в&nbsp;АИС</p>
              </div>
            </div>
            <svg class="w-6 h-6 text-[#0e888d] group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ───────── Page scaffolding ───────── */
.about-page {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #415861;
}

.about-hero {
  padding: 48px 0 36px;
  background: linear-gradient(180deg, #f6fbfb 0%, #ffffff 100%);
}
@media (min-width: 1024px) {
  .about-hero { padding: 80px 0 48px; }
}

.about-section {
  padding: 40px 0 56px;
  background: white;
}
@media (min-width: 1024px) {
  .about-section { padding: 56px 0 88px; }
}

.about-footer {
  padding: 48px 0 72px;
  background: white;
}
@media (min-width: 1024px) {
  .about-footer { padding: 60px 0 100px; }
}

.section-head { max-width: 860px; margin-bottom: 40px; }
@media (min-width: 1024px) { .section-head { margin-bottom: 56px; } }

.section-lede {
  font-size: 16px; line-height: 1.6;
  color: rgba(65, 88, 97, 0.8);
  max-width: 680px;
}
@media (min-width: 768px) { .section-lede { font-size: 18px; } }

/* ───────── Type ───────── */
.eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.18em;
  text-transform: uppercase;
}
.eyebrow::before {
  content: ''; width: 8px; height: 8px;
  background: currentColor; border-radius: 1px;
}

.h1-display {
  font-size: 30px; line-height: 1.1; font-weight: 700;
  color: #415861; text-transform: uppercase;
  letter-spacing: -0.005em; text-wrap: balance;
}
@media (min-width: 768px) {
  .h1-display { font-size: 40px; line-height: 1.08; }
}
@media (min-width: 1024px) {
  .h1-display { font-size: 50px; line-height: 1.06; letter-spacing: -0.01em; }
}

.h2-display {
  font-size: 26px; line-height: 1.15; font-weight: 700;
  color: #415861; text-transform: uppercase;
  letter-spacing: -0.005em;
}
@media (min-width: 1024px) {
  .h2-display { font-size: 36px; line-height: 1.12; }
}

.lede {
  font-size: 16px; line-height: 1.6;
  color: rgba(65, 88, 97, 0.85);
  max-width: 620px;
}
@media (min-width: 768px) { .lede { font-size: 18px; } }
@media (min-width: 1024px) { .lede { font-size: 19px; line-height: 30px; } }

.meta-tag {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(65, 88, 97, 0.55);
}

.link-arrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-weight: 600; font-size: 15px;
  color: var(--link, #0e888d);
  transition: gap 0.15s ease;
  align-self: flex-start;
  margin-top: auto;
}
.link-arrow:hover { gap: 10px; }

/* ───────── Hero photo-card (NEW v2) ───────── */
.hero-photo-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 14px 14px 18px;
  box-shadow: 0 22px 46px rgba(65, 88, 97, 0.08);
  margin: 0;
  display: flex; flex-direction: column;
}
@media (min-width: 1024px) {
  .hero-photo-card { padding: 16px 16px 20px; border-radius: 28px; }
}

.hero-photo {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 5 / 4;
  background: #e2e8f0;
}
.hero-photo img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.hero-photo-placeholder {
  position: absolute; inset: 0;
  background: #fdfdfb;
  overflow: hidden;
}

/* ───── Современная editorial статья ───── */
.newspaper {
  position: relative;
  width: 100%; height: 100%;
  padding: 22px 22px 18px;
  display: flex; flex-direction: column;
  color: #14181b;
}
@media (min-width: 1024px) {
  .newspaper { padding: 26px 26px 20px; }
}

.newspaper-masthead {
  display: flex; justify-content: space-between; align-items: center;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10px; font-weight: 600; letter-spacing: 0.16em;
  text-transform: uppercase; color: #9ca3af;
  padding-bottom: 14px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 18px;
}
.newspaper-brand {
  display: inline-flex; align-items: center; gap: 8px;
  color: #14181b;
}
.newspaper-brand-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: #0e888d;
}

.newspaper-eyebrow {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; color: #0e888d;
  margin-bottom: 10px;
}

.newspaper-title {
  font-family: Georgia, 'Source Serif Pro', 'Times New Roman', serif;
  font-size: 22px; line-height: 1.12;
  font-weight: 500; font-style: normal;
  letter-spacing: -0.015em;
  color: #14181b;
  margin: 0 0 12px;
  text-wrap: balance;
}
@media (min-width: 1024px) {
  .newspaper-title { font-size: 25px; line-height: 1.1; }
}

.newspaper-meta {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: #6b7280;
  margin-bottom: 16px;
}
.newspaper-meta-sep {
  width: 14px; height: 1px; background: #d1d5db;
}

.newspaper-rule {
  height: 1px; background: #e5e7eb;
  margin-bottom: 14px;
}

.newspaper-columns {
  flex: 1;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px;
  font-family: Georgia, 'Source Serif Pro', serif;
  font-size: 9px; line-height: 1.55;
  color: #4b5563;
  text-align: left;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .newspaper-columns { font-size: 10px; line-height: 1.6; gap: 18px; }
}
.newspaper-columns p { margin: 0; }
.newspaper-columns p + p { margin-top: 8px; }

/* ───── Photo tag - современный «label» ───── */
.hero-photo-tag {
  position: absolute; left: 16px; bottom: 16px;
  display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #14181b;
  font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: #fdfdfb;
  z-index: 2;
}
.hero-photo-tag-dot {
  width: 6px; height: 6px; border-radius: 999px; background: #0e888d;
}

.hero-quote {
  padding: 18px 14px 2px;
}
@media (min-width: 1024px) {
  .hero-quote { padding: 20px 18px 2px; }
}

.hero-quote-text {
  font-size: 16px; line-height: 1.55;
  font-style: italic; font-weight: 500;
  color: #415861;
  margin: 0 0 14px;
  text-wrap: pretty;
}
@media (min-width: 1024px) {
  .hero-quote-text { font-size: 17px; line-height: 1.6; }
}

.hero-quote-attribution {
  font-size: 13px;
  color: rgba(65, 88, 97, 0.65);
  font-weight: 500;
}

/* ───────── Pills ───────── */
.pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 999px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase;
}
.pill-dot {
  width: 6px; height: 6px; border-radius: 999px; background: currentColor;
}
.pill-teal  { background: rgba(14, 136, 141, 0.10); color: #0e888d; }
.pill-green { background: rgba(45, 139, 78, 0.10);  color: #2D8B4E; }

/* ───────── Step flows (Section 2) ───────── */
.step-flow {
  border-radius: 24px;
  padding: 36px 32px 32px;
  background: white;
  border: 1px solid #e2e8f0;
  display: flex; flex-direction: column;
}
@media (min-width: 768px) {
  .step-flow { padding: 44px 40px 36px; }
}
.step-flow.tone-teal  { border-color: rgba(14, 136, 141, 0.18); }
.step-flow.tone-green { border-color: rgba(45, 139, 78, 0.20); }

.flow-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}

.flow-title {
  font-size: 24px; font-weight: 700; color: #415861;
  line-height: 1.2; margin-bottom: 8px;
}
@media (min-width: 1024px) { .flow-title { font-size: 28px; } }

.flow-audience {
  font-size: 15px; font-style: italic;
  color: rgba(65, 88, 97, 0.7);
  margin-bottom: 32px;
}
@media (min-width: 1024px) { .flow-audience { font-size: 16px; } }

.timeline {
  position: relative;
  list-style: none; padding: 0; margin: 0 0 28px;
}
.timeline::before {
  content: ''; position: absolute; left: 19px; top: 18px; bottom: 18px;
  width: 2px; background: currentColor; opacity: 0.18;
}
.tone-teal  .timeline::before { color: #0e888d; }
.tone-green .timeline::before { color: #2D8B4E; }

.timeline-step { position: relative; padding-left: 60px; }
.timeline-step + .timeline-step { margin-top: 22px; }

.timeline-num {
  position: absolute; left: 0; top: 0;
  width: 42px; height: 42px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px; letter-spacing: 0.04em;
  background: white;
  border: 2px solid currentColor;
}
.tone-teal  .timeline-num { color: #0e888d; }
.tone-green .timeline-num { color: #2D8B4E; }

.step-title {
  font-size: 17px; font-weight: 600; color: #415861;
  margin-bottom: 5px;
}
.step-desc {
  font-size: 15px; line-height: 1.55;
  color: rgba(65, 88, 97, 0.78);
}

/* ───────── Встроенная download-секция (footer step-flow utilsbor) ───────── */
.flow-download {
  display: flex; align-items: center; gap: 14px;
  margin-top: 24px;
  padding-top: 22px;
  padding-bottom: 2px;
  border-top: 1px solid rgba(14, 136, 141, 0.16);
  text-decoration: none;
  transition: opacity 0.15s ease;
}
.flow-download:hover { opacity: 0.92; }

.flow-download-icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  background: rgba(14, 136, 141, 0.08);
  color: #0e888d;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.flow-download-icon svg { width: 20px; height: 20px; }

.flow-download-body { flex: 1; min-width: 0; }
.flow-download-title {
  font-size: 15px; font-weight: 600; color: #415861;
  line-height: 1.3; margin-bottom: 3px;
}
.flow-download-meta {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.10em;
  text-transform: uppercase; color: rgba(65, 88, 97, 0.55);
}
.flow-download-dot {
  width: 3px; height: 3px; border-radius: 999px;
  background: rgba(65, 88, 97, 0.4);
}

.flow-download-cta {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: white;
  border: 1px solid rgba(14, 136, 141, 0.28);
  color: #0e888d;
  font-size: 13px; font-weight: 600;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.flow-download:hover .flow-download-cta {
  background: #0e888d;
  border-color: #0e888d;
  color: white;
}

@media (max-width: 480px) {
  .flow-download { flex-wrap: wrap; }
  .flow-download-cta { width: 100%; justify-content: center; }
}

/* ───────── Editorial quote (NEW v2) ───────── */
.about-quote {
  padding: 80px 0;
  background: #f1f7f7;
}
@media (min-width: 1024px) {
  .about-quote { padding: 120px 0; }
}

.quote-shell {
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
}

.quote-text {
  margin: 0;
  font-size: clamp(22px, 3vw, 32px);
  line-height: 1.3;
  font-weight: 600;
  font-style: italic;
  color: #415861;
  letter-spacing: -0.005em;
  text-wrap: balance;
}

.quote-attribution {
  margin-top: 28px;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 12px;
  font-size: 13px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(65, 88, 97, 0.6);
}
.quote-rule {
  display: inline-block;
  width: 28px; height: 2px;
  background: #0e888d;
  border-radius: 2px;
}

/* ───────── Audience cards (Section 3) ───────── */
.audience-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 28px;
  background: white;
  transition: all 0.2s ease;
  display: flex; flex-direction: column;
  min-height: 260px;
  position: relative; overflow: hidden;

  --tone: #0e888d;
  --tone-soft: rgba(14, 136, 141, 0.10);
}
.audience-card::before {
  content: ''; position: absolute; left: 0; right: 0; top: 0; height: 3px;
  background: var(--tone);
}
.audience-card:hover {
  transform: translateY(-2px);
  border-color: var(--tone);
  box-shadow: 0 14px 28px rgba(65, 88, 97, 0.08);
}
.audience-card.tone-teal   { --tone: #0e888d; --tone-soft: rgba(14, 136, 141, 0.10); }
.audience-card.tone-green  { --tone: #2D8B4E; --tone-soft: rgba(45, 139, 78, 0.10); }
.audience-card.tone-slate  { --tone: #415861; --tone-soft: rgba(65, 88, 97, 0.10); }
.audience-card.tone-yellow { --tone: #fea629; --tone-soft: rgba(254, 166, 41, 0.14); }

.audience-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--tone-soft); color: var(--tone);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
}

.audience-title {
  font-size: 19px; font-weight: 700; color: #415861;
  line-height: 1.3; margin-bottom: 6px;
}
@media (min-width: 1024px) { .audience-title { font-size: 20px; } }

.audience-subtitle {
  font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
  color: var(--tone);
  margin-bottom: 14px;
  line-height: 1.4;
}

.audience-desc {
  font-size: 15px; line-height: 1.55;
  color: rgba(65, 88, 97, 0.78);
}

/* ───────── Footer / Glossary card ───────── */
.glossary-card {
  display: block;
  background: linear-gradient(90deg, rgba(14, 136, 141, 0.10), rgba(14, 136, 141, 0.04));
  border: 1px solid rgba(14, 136, 141, 0.20);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s ease;
}
.glossary-card:hover {
  border-color: rgba(14, 136, 141, 0.40);
}
@media (min-width: 1024px) {
  .glossary-card { padding: 32px; border-radius: 20px; }
}

.glossary-icon {
  width: 48px; height: 48px;
  background: #0e888d;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
@media (min-width: 1024px) {
  .glossary-icon { width: 56px; height: 56px; border-radius: 14px; }
}

.glossary-title {
  font-size: 18px; font-weight: 600; color: #415861;
  transition: color 0.15s ease;
}
@media (min-width: 1024px) { .glossary-title { font-size: 20px; } }

.group:hover .glossary-title { color: #0e888d; }

.glossary-desc {
  font-size: 14px;
  color: rgba(65, 88, 97, 0.65);
  margin-top: 2px;
}
</style>
