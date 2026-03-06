import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = resolve(__dirname, '../src/locales')

const legalBaseRu = {
  title: "Нормативно-правовая база",
  subtitle: "Полная база нормативных правовых актов в сфере обращения с отходами и расширенной ответственности производителей, а также ответы на часто задаваемые вопросы",
  tabNpa: "Нормативные акты",
  tabFaq: "Вопросы и ответы",
  searchNpa: "Поиск по названию, номеру или описанию...",
  searchFaq: "Поиск по вопросам и ответам...",
  allDocuments: "Все документы",
  allQuestions: "Все вопросы",
  found: "Найдено",
  noResults: "Ничего не найдено",
  tryDifferentQuery: "Попробуйте изменить поисковый запрос или фильтр",
  viewOnSite: "Перейти на источник",
  categories: {
    laws: "Законы КР",
    decrees: "Постановления Правительства",
    regulations: "Ведомственные приказы",
    technical: "Технические стандарты",
    international: "Международные соглашения"
  },
  faqCategories: {
    general: "Общие вопросы",
    payment: "Утилизационный сбор",
    recycling: "Переработка отходов",
    licensing: "Лицензирование",
    reporting: "Отчётность и декларации"
  },
  docs: {
    d1: {
      title: "Закон КР «Об отходах производства и потребления»",
      desc: "Основной закон, регулирующий правоотношения в сфере обращения с отходами производства и потребления на территории Кыргызской Республики."
    },
    d2: {
      title: "Закон КР «Об охране окружающей среды»",
      desc: "Определяет правовые основы охраны окружающей среды, обеспечения экологической безопасности, предотвращения вредного воздействия."
    },
    d3: {
      title: "Закон КР «Об экологической экспертизе»",
      desc: "Устанавливает порядок проведения экологической экспертизы проектов и объектов хозяйственной деятельности."
    },
    d4: {
      title: "Закон КР «О порядке рассмотрения обращений граждан»",
      desc: "Регулирует порядок подачи и рассмотрения обращений граждан государственными органами. Срок рассмотрения — 30 календарных дней."
    },
    d5: {
      title: "Закон КР «О техническом регулировании»",
      desc: "Определяет требования к технической безопасности продукции, в том числе упаковки и отходов."
    },
    d6: {
      title: "Закон КР «О расширенной ответственности производителей (импортёров)»",
      desc: "Устанавливает механизм расширенной ответственности производителей и импортёров за утилизацию товаров и упаковки после утраты потребительских свойств."
    },
    d7: {
      title: "Постановление Правительства КР «О ставках утилизационного сбора»",
      desc: "Утверждает ставки утилизационного сбора по товарным группам и нормативы переработки."
    },
    d8: {
      title: "Постановление Правительства КР «О порядке уплаты утилизационного сбора»",
      desc: "Определяет порядок исчисления, уплаты и администрирования утилизационного сбора."
    },
    d9: {
      title: "Постановление Правительства КР «Об утверждении Положения о ГП «Эко Оператор»",
      desc: "Утверждает положение о государственном предприятии «Эко Оператор» — администраторе системы РОП."
    },
    d10: {
      title: "Постановление Правительства КР «О Реестре плательщиков утильсбора»",
      desc: "Определяет порядок ведения Реестра плательщиков утилизационного сбора и требования к регистрации."
    },
    d11: {
      title: "Постановление Правительства КР «О цифровизации системы РОП»",
      desc: "Утверждает план перехода на цифровую платформу АИС «Цифровой реестр отходов» для автоматизации процессов РОП."
    },
    d12: {
      title: "Приказ МПРЭТН «Об утверждении форм отчётности»",
      desc: "Утверждает формы квартальной и годовой отчётности по обращению с отходами для предприятий."
    },
    d13: {
      title: "Приказ МПРЭТН «О порядке лицензирования деятельности по переработке отходов»",
      desc: "Регулирует процедуру выдачи, приостановления и отзыва лицензий на деятельность по переработке отходов."
    },
    d14: {
      title: "Приказ МПРЭТН «Об утверждении Методики расчёта утильсбора»",
      desc: "Устанавливает методику расчёта утилизационного сбора, формулы исчисления и порядок определения облагаемого объёма."
    },
    d15: {
      title: "Приказ МПРЭТН «О порядке возврата утилизационного сбора»",
      desc: "Определяет условия, процедуру и сроки возврата утилизационного сбора переработчикам при выполнении нормативов."
    },
    d16: {
      title: "Приказ МПРЭТН «Об утверждении Классификатора отходов КР»",
      desc: "Утверждает классификатор отходов по видам, классам опасности и источникам образования."
    },
    d17: {
      title: "Санитарные правила и нормы по обращению с отходами",
      desc: "Гигиенические требования к размещению и обезвреживанию отходов производства и потребления."
    },
    d18: {
      title: "Стандарт ISO 14001 — Системы экологического менеджмента",
      desc: "Международный стандарт, устанавливающий требования к системам экологического менеджмента для организаций."
    },
    d19: {
      title: "ГОСТ 30772-2001 — Ресурсосбережение. Обращение с отходами. Термины и определения",
      desc: "Межгосударственный стандарт, определяющий основные термины и определения в области обращения с отходами."
    },
    d20: {
      title: "Технический регламент ЕАЭС «Об ограничении применения опасных веществ»",
      desc: "Регулирует ограничение использования опасных веществ в электрическом и электронном оборудовании."
    },
    d21: {
      title: "Базельская конвенция о контроле за трансграничной перевозкой опасных отходов",
      desc: "Международная конвенция о контроле за трансграничной перевозкой опасных отходов и их удалением. КР присоединилась в 1996 г."
    },
    d22: {
      title: "Стокгольмская конвенция о стойких органических загрязнителях",
      desc: "Конвенция направлена на прекращение или ограничение производства и использования стойких органических загрязнителей."
    },
    d23: {
      title: "Орхусская конвенция о доступе к экологической информации",
      desc: "Конвенция о доступе к информации, участии общественности в принятии решений и доступе к правосудию по экологическим вопросам."
    },
    d24: {
      title: "Цели устойчивого развития ООН — Цель 12",
      desc: "ЦУР 12: Ответственное потребление и производство. Обеспечение перехода к рациональным моделям потребления и производства."
    },
    d25: {
      title: "Соглашение ЕАЭС о координации экологической политики",
      desc: "Соглашение стран-членов ЕАЭС о координации подходов к экологическому регулированию и обращению с отходами."
    }
  },
  faq: {
    q1: "Что такое расширенная ответственность производителей (РОП)?",
    a1: "Расширенная ответственность производителей (РОП) — это принцип экологической политики, согласно которому производители и импортёры товаров несут ответственность за утилизацию своей продукции и упаковки после утраты потребительских свойств. В Кыргызстане механизм РОП реализуется через уплату утилизационного сбора в пользу ГП «Эко Оператор».",
    q2: "Что такое АИС «Цифровой реестр отходов»?",
    a2: "АИС «Цифровой реестр отходов» — это автоматизированная информационная система для учёта и контроля обращения с отходами в Кыргызской Республике. Система обеспечивает:\n• Регистрацию плательщиков утильсбора\n• Расчёт и уплату утилизационного сбора\n• Подачу деклараций и отчётов\n• Ведение реестров переработчиков и полигонов\n• ГИС-мониторинг объектов обращения с отходами",
    q3: "Кто должен регистрироваться в системе?",
    a3: "В системе обязаны зарегистрироваться:\n• Производители товаров и упаковки на территории КР\n• Импортёры товаров и упаковки в КР\n• Организации, осуществляющие переработку отходов\n• Операторы полигонов ТБО и пунктов приёма\n\nРегистрация бесплатна и доступна через портал АИС ЦРО.",
    q4: "Какие роли существуют в системе?",
    a4: "В системе предусмотрены следующие роли:\n• Плательщик — производитель или импортёр, обязанный уплачивать утильсбор\n• Эко Оператор — ГП «Эко Оператор», администратор системы РОП\n• Сотрудник МПРЭТН — специалист Министерства природных ресурсов\n• Администратор — системный администратор АИС",

    q5: "Кто обязан уплачивать утилизационный сбор?",
    a5: "Утилизационный сбор обязаны уплачивать:\n• Производители товаров и упаковки, зарегистрированные на территории КР\n• Импортёры товаров и упаковки, ввозящие продукцию в КР\n\nОсвобождаются от уплаты организации, самостоятельно обеспечивающие переработку отходов в объёме не менее установленного норматива.",
    q6: "Как рассчитывается утилизационный сбор?",
    a6: "Утилизационный сбор рассчитывается по формуле:\n\nСумма = Объём (тонн) × Норматив переработки (%) × Ставка (сом/тонна)\n\nОблагаемый объём уменьшается на количество отходов, переданных на переработку или вывезенных из КР. Калькулятор доступен в разделе «Калькулятор РОП» портала.",
    q7: "Каковы сроки уплаты утилизационного сбора?",
    a7: "Утилизационный сбор уплачивается ежеквартально:\n• За I квартал — до 25 апреля\n• За II квартал — до 25 июля\n• За III квартал — до 25 октября\n• За IV квартал — до 25 января следующего года\n\nДля импортёров — в течение 30 дней с даты таможенного оформления.",
    q8: "Что будет, если не уплатить утильсбор вовремя?",
    a8: "За несвоевременную уплату утилизационного сбора начисляется пеня в размере 0,1% от суммы задолженности за каждый день просрочки. Максимальный размер пени не может превышать 50% от суммы основного долга. При длительной неуплате возможно административное взыскание.",
    q9: "Можно ли вернуть уплаченный утильсбор?",
    a9: "Да, возврат утилизационного сбора возможен в следующих случаях:\n• Переработчик выполнил нормативы переработки (частичный или полный возврат)\n• Ошибочная или излишняя уплата (по заявлению)\n• Вывоз товаров из КР после уплаты сбора (реэкспорт)\n\nЗаявление на возврат подаётся через личный кабинет в АИС ЦРО.",

    q10: "Какие нормативы переработки действуют?",
    a10: "Нормативы переработки устанавливаются постановлением Правительства КР и варьируются по товарным группам:\n• Бумага и картон — 15-20%\n• Пластик — 10-15%\n• Стекло — 10-15%\n• Металлы — 15-25%\n• Шины — 20%\n• Электроника — 5-10%\n\nНормативы пересматриваются не реже одного раза в 3 года.",
    q11: "Как подтвердить факт переработки отходов?",
    a11: "Для подтверждения факта переработки необходимо:\n• Заключить договор с лицензированным переработчиком\n• Получить акт приёма-передачи отходов на переработку\n• Предоставить акт о фактической переработке с указанием объёмов\n• Загрузить подтверждающие документы в АИС ЦРО\n\nВсе документы проверяются ГП «Эко Оператор».",
    q12: "Где найти список лицензированных переработчиков?",
    a12: "Реестр лицензированных переработчиков доступен в разделе «Реестры» портала АИС ЦРО. В реестре указаны:\n• Наименование и ИНН переработчика\n• Виды перерабатываемых отходов\n• Мощность переработки (тонн/год)\n• Срок действия лицензии\n• Контактные данные",
    q13: "Какие виды отходов подлежат переработке в рамках РОП?",
    a13: "В рамках РОП переработке подлежат:\n• Упаковка (бумага, картон, пластик, стекло, металл, дерево)\n• Шины и покрышки\n• Аккумуляторы и батарейки\n• Электронное и электрическое оборудование\n• Масла и смазки\n• Транспортные средства (в перспективе)\n\nПолный перечень товарных групп — в Приложении к Закону о РОП.",

    q14: "Как получить лицензию на переработку отходов?",
    a14: "Для получения лицензии необходимо:\n1. Подать заявление в МПРЭТН КР\n2. Предоставить документы: учредительные, техническую документацию на оборудование, заключение экологической экспертизы\n3. Пройти проверку соответствия технологического процесса\n4. Оплатить лицензионный сбор\n\nСрок рассмотрения — до 30 рабочих дней. Лицензия выдаётся на 5 лет.",
    q15: "Какие требования предъявляются к переработчикам?",
    a15: "Основные требования:\n• Наличие лицензии МПРЭТН на деятельность по переработке\n• Соответствие оборудования экологическим и санитарным нормам\n• Наличие системы учёта принимаемых и перерабатываемых отходов\n• Ведение отчётности в АИС ЦРО\n• Прохождение ежегодных проверок",
    q16: "Можно ли приостановить или аннулировать лицензию?",
    a16: "Лицензия может быть приостановлена или аннулирована в случаях:\n• Нарушение условий лицензирования\n• Непредоставление отчётности более 2 кварталов\n• Систематическое нарушение экологических норм\n• По заявлению лицензиата\n\nПриостановление — на срок до 6 месяцев для устранения нарушений.",
    q17: "Сколько стоит лицензия на переработку?",
    a17: "Размер лицензионного сбора зависит от вида деятельности:\n• Переработка ТБО — 5 000 сом\n• Переработка промышленных отходов — 10 000 сом\n• Переработка опасных отходов — 20 000 сом\n\nЛицензия продлевается каждые 5 лет. Стоимость продления — 50% от первичного сбора.",

    q18: "Какие отчёты нужно подавать в АИС ЦРО?",
    a18: "Через АИС ЦРО подаются следующие отчёты:\n• Квартальный расчёт утилизационного сбора (все плательщики)\n• Декларация об объёмах производства/импорта (ежегодно)\n• Отчёт о переработке отходов (переработчики, ежеквартально)\n• Отчёт об объёмах захоронения (операторы полигонов)\n\nВсе отчёты подаются в электронном виде через личный кабинет.",
    q19: "Каковы сроки подачи отчётности?",
    a19: "Сроки подачи отчётности:\n• Квартальный расчёт — до 20 числа месяца, следующего за кварталом\n• Годовая декларация — до 1 марта следующего года\n• Отчёт переработчика — до 15 числа месяца, следующего за кварталом\n• Отчёт полигона — до 15 числа каждого месяца",
    q20: "Что будет за непредоставление отчётности?",
    a20: "За непредоставление отчётности предусмотрены:\n• Предупреждение при первом нарушении\n• Штраф от 5 000 до 20 000 сом при повторном нарушении\n• Приостановление лицензии при систематическом непредоставлении\n• Начисление утильсбора по максимальной ставке при отсутствии расчёта",
    q21: "Как исправить ошибку в поданном отчёте?",
    a21: "Для исправления ошибки:\n1. Перейдите в раздел «Расчёт утильсбора» или «Отчёты» в личном кабинете\n2. Найдите документ со статусом «Отклонён» или «На доработке»\n3. Создайте корректирующий документ с правильными данными\n4. Приложите пояснительную записку\n5. Отправьте на повторную проверку\n\nКорректировки принимаются в течение отчётного периода.",
    q22: "Где скачать формы отчётности?",
    a22: "Формы отчётности автоматически формируются в личном кабинете АИС ЦРО. Также шаблоны доступны:\n• В разделе «Документы» личного кабинета\n• На странице «Законодательство» портала\n• По запросу в ГП «Эко Оператор»"
  }
}

const legalBaseKy = {
  title: "Ченемдик-укуктук база",
  subtitle: "Калдыктарды башкаруу жана өндүрүүчүлөрдүн кеңейтилген жоопкерчилиги тармагындагы ченемдик укуктук актылардын толук базасы, ошондой эле көп берилүүчү суроолорго жооптор",
  tabNpa: "Ченемдик актылар",
  tabFaq: "Суроо-жооптор",
  searchNpa: "Аталышы, номери же сүрөттөмөсү боюнча издөө...",
  searchFaq: "Суроолор жана жооптор боюнча издөө...",
  allDocuments: "Бардык документтер",
  allQuestions: "Бардык суроолор",
  found: "Табылды",
  noResults: "Эч нерсе табылган жок",
  tryDifferentQuery: "Издөө сурамын же чыпканы өзгөртүп көрүңүз",
  viewOnSite: "Булакка өтүү",
  categories: {
    laws: "КР Мыйзамдары",
    decrees: "Өкмөт токтомдору",
    regulations: "Ведомстволук буйруктар",
    technical: "Техникалык стандарттар",
    international: "Эл аралык келишимдер"
  },
  faqCategories: {
    general: "Жалпы суроолор",
    payment: "Утилдештирүү жыйымы",
    recycling: "Калдыктарды кайра иштетүү",
    licensing: "Лицензиялоо",
    reporting: "Отчёттуулук жана декларациялар"
  },
  docs: {
    d1: { title: "КР Мыйзамы «Өндүрүш жана керектөө калдыктары жөнүндө»", desc: "Кыргыз Республикасынын аймагында өндүрүш жана керектөө калдыктары менен иш алып баруу тармагындагы укуктук мамилелерди жөнгө салган негизги мыйзам." },
    d2: { title: "КР Мыйзамы «Айлана-чөйрөнү коргоо жөнүндө»", desc: "Айлана-чөйрөнү коргоонун, экологиялык коопсуздукту камсыз кылуунун укуктук негиздерин аныктайт." },
    d3: { title: "КР Мыйзамы «Экологиялык экспертиза жөнүндө»", desc: "Чарба ишмердүүлүгүнүн долбоорлоруна жана объектилерине экологиялык экспертиза жүргүзүү тартибин белгилейт." },
    d4: { title: "КР Мыйзамы «Жарандардын кайрылууларын кароо тартиби жөнүндө»", desc: "Мамлекеттик органдар тарабынан жарандардын кайрылууларын берүү жана кароо тартибин жөнгө салат. Кароо мөөнөтү — 30 календардык күн." },
    d5: { title: "КР Мыйзамы «Техникалык жөнгө салуу жөнүндө»", desc: "Продукцияга, анын ичинде таңгактоого жана калдыктарга техникалык коопсуздук талаптарын аныктайт." },
    d6: { title: "КР Мыйзамы «Өндүрүүчүлөрдүн (импорттоочулардын) кеңейтилген жоопкерчилиги жөнүндө»", desc: "Өндүрүүчүлөр жана импорттоочулар товарларды жана таңгакты керектөө касиеттерин жоготкондон кийин утилдештирүү үчүн жоопкерчилик механизмин белгилейт." },
    d7: { title: "КР Өкмөтүнүн токтому «Утилдештирүү жыйымынын ставкалары жөнүндө»", desc: "Товардык топтор боюнча утилдештирүү жыйымынын ставкаларын жана кайра иштетүү ченемдерин бекитет." },
    d8: { title: "КР Өкмөтүнүн токтому «Утилдештирүү жыйымын төлөө тартиби жөнүндө»", desc: "Утилдештирүү жыйымын эсептөө, төлөө жана башкаруу тартибин аныктайт." },
    d9: { title: "КР Өкмөтүнүн токтому «МК «Эко Оператор» жөнүндөгү Жободу бекитүү жөнүндө»", desc: "РӨЖ тутумунун администратору — «Эко Оператор» мамлекеттик ишканасы жөнүндөгү жобону бекитет." },
    d10: { title: "КР Өкмөтүнүн токтому «Утилдештирүү жыйымын төлөөчүлөрдүн реестри жөнүндө»", desc: "Утилдештирүү жыйымын төлөөчүлөрдүн реестрин жүргүзүү тартибин жана каттоого коюлуучу талаптарды аныктайт." },
    d11: { title: "КР Өкмөтүнүн токтому «РӨЖ тутумун санариптештирүү жөнүндө»", desc: "РӨЖ процесстерин автоматташтыруу үчүн АМС «Калдыктардын санариптик реестри» санариптик платформасына өтүү планын бекитет." },
    d12: { title: "ЖРЭТК буйругу «Отчёттуулук формаларын бекитүү жөнүндө»", desc: "Ишканалар үчүн калдыктарды башкаруу боюнча чейрек сайын жана жылдык отчёттуулук формаларын бекитет." },
    d13: { title: "ЖРЭТК буйругу «Калдыктарды кайра иштетүү ишмердүүлүгүн лицензиялоо тартиби жөнүндө»", desc: "Калдыктарды кайра иштетүү ишмердүүлүгүнө лицензияларды берүү, тоготуу жана кайтарып алуу процедурасын жөнгө салат." },
    d14: { title: "ЖРЭТК буйругу «Утильсбор эсептөөнүн Методикасын бекитүү жөнүндө»", desc: "Утилдештирүү жыйымын эсептөө методикасын, формулаларды жана салынуучу көлөмдү аныктоо тартибин белгилейт." },
    d15: { title: "ЖРЭТК буйругу «Утилдештирүү жыйымын кайтаруу тартиби жөнүндө»", desc: "Ченемдерди аткарганда кайра иштетүүчүлөргө утилдештирүү жыйымын кайтаруу шарттарын, процедурасын жана мөөнөттөрүн аныктайт." },
    d16: { title: "ЖРЭТК буйругу «КР Калдыктар классификаторун бекитүү жөнүндө»", desc: "Калдыктарды түрлөрү, коркунуч класстары жана пайда болуу булактары боюнча классификаторду бекитет." },
    d17: { title: "Калдыктарды башкаруу боюнча санитардык эрежелер жана ченемдер", desc: "Өндүрүш жана керектөө калдыктарын жайгаштырууга жана зыянсыздандырууга гигиеналык талаптар." },
    d18: { title: "ISO 14001 стандарты — Экологиялык менеджмент тутумдары", desc: "Уюмдар үчүн экологиялык менеджмент тутумдарына талаптарды белгилөөчү эл аралык стандарт." },
    d19: { title: "ГОСТ 30772-2001 — Ресурстарды үнөмдөө. Калдыктарды башкаруу", desc: "Калдыктарды башкаруу тармагындагы негизги терминдерди жана аныктамаларды белгилөөчү мамлекеттер аралык стандарт." },
    d20: { title: "ЕАЭБ техникалык регламенти «Коркунучтуу заттарды колдонууну чектөө жөнүндө»", desc: "Электр жана электрондук жабдууларда коркунучтуу заттарды колдонууну чектөөнү жөнгө салат." },
    d21: { title: "Базель конвенциясы — коркунучтуу калдыктарды чек ара аркылуу ташуу", desc: "Коркунучтуу калдыктарды чек ара аркылуу ташууну контролдоо жана жок кылуу боюнча эл аралык конвенция. КР 1996-ж. кошулган." },
    d22: { title: "Стокгольм конвенциясы — туруктуу органикалык булгоочулар", desc: "Туруктуу органикалык булгоочуларды өндүрүүнү жана колдонууну токтотууга же чектөөгө багытталган конвенция." },
    d23: { title: "Орхус конвенциясы — экологиялык маалыматка жетүү", desc: "Маалыматка жетүү, коомчулуктун чечим кабыл алууга катышуусу жана экологиялык маселелер боюнча сот адилеттигине жетүү жөнүндөгү конвенция." },
    d24: { title: "БУУнун Туруктуу өнүгүү максаттары — Максат 12", desc: "ТӨМ 12: Жоопкерчиликтүү керектөө жана өндүрүш. Акылга сыярлык керектөө жана өндүрүш моделдерине өтүүнү камсыз кылуу." },
    d25: { title: "ЕАЭБ экологиялык саясатты координациялоо жөнүндө макулдашуу", desc: "ЕАЭБ мүчө өлкөлөрүнүн экологиялык жөнгө салуу жана калдыктарды башкаруу боюнча мамилелерин координациялоо жөнүндө макулдашуу." }
  },
  faq: {
    q1: "Өндүрүүчүлөрдүн кеңейтилген жоопкерчилиги (РӨЖ) деген эмне?", a1: "Өндүрүүчүлөрдүн кеңейтилген жоопкерчилиги (РӨЖ) — бул өндүрүүчүлөр жана импорттоочулар өз продукциясын жана таңгакты керектөө касиеттерин жоготкондон кийин утилдештирүүгө жоопкер болгон экологиялык саясаттын принциби. Кыргызстанда РӨЖ механизми МК «Эко Оператор» пайдасына утилдештирүү жыйымын төлөө аркылуу жүзөгө ашырылат.",
    q2: "АМС «Калдыктардын санариптик реестри» деген эмне?", a2: "АМС «Калдыктардын санариптик реестри» — Кыргыз Республикасында калдыктарды башкарууну эсепке алуу жана контролдоо үчүн автоматташтырылган маалымат тутуму.",
    q3: "Тутумда ким катталышы керек?", a3: "Тутумда катталышы тийиш:\n• КР аймагында товарларды жана таңгакты өндүрүүчүлөр\n• КР га товарларды жана таңгакты импорттоочулар\n• Калдыктарды кайра иштетүүнү жүзөгө ашырган уюмдар\n• Полигон операторлору жана кабыл алуу пункттары",
    q4: "Тутумда кандай ролдор бар?", a4: "Тутумда төмөнкү ролдор каралган:\n• Төлөөчү — утилдештирүү жыйымын төлөөгө милдеттүү өндүрүүчү же импорттоочу\n• Эко Оператор — МК «Эко Оператор», РӨЖ тутумунун администратору\n• ЖРЭТК кызматкери — Жаратылыш ресурстары министрлигинин адиси\n• Администратор — АМС тутумдук администратору",
    q5: "Утилдештирүү жыйымын ким төлөшү керек?", a5: "Утилдештирүү жыйымын төлөөгө милдеттүүлөр:\n• КР аймагында катталган товарларды жана таңгакты өндүрүүчүлөр\n• КР га продукция ташып келген импорттоочулар",
    q6: "Утилдештирүү жыйымы кантип эсептелет?", a6: "Утилдештирүү жыйымы формула боюнча эсептелет:\n\nСумма = Көлөм (тонна) × Кайра иштетүү ченеми (%) × Ставка (сом/тонна)",
    q7: "Утилдештирүү жыйымын төлөө мөөнөттөрү кандай?", a7: "Утилдештирүү жыйымы чейрек сайын төлөнөт:\n• I чейрек үчүн — 25 апрелге чейин\n• II чейрек үчүн — 25 июлга чейин\n• III чейрек үчүн — 25 октябрга чейин\n• IV чейрек үчүн — кийинки жылдын 25 январына чейин",
    q8: "Утилдештирүү жыйымын өз убагында төлөбөсө эмне болот?", a8: "Өз убагында төлөнбөсө карыздын суммасынан ар бир кечигүү күнү үчүн 0,1% өлчөмүндө туум чегерилет.",
    q9: "Төлөнгөн утилдештирүү жыйымын кайтарууга болобу?", a9: "Ооба, утилдештирүү жыйымын кайтаруу төмөнкү учурларда мүмкүн:\n• Кайра иштетүүчү кайра иштетүү ченемдерин аткарган\n• Ката же ашыкча төлөм\n• Сбор төлөнгөндөн кийин товарларды КР дан чыгаруу",
    q10: "Кайра иштетүүнүн кандай ченемдери колдонулат?", a10: "Кайра иштетүү ченемдери КР Өкмөтүнүн токтому менен белгиленет жана товардык топтор боюнча айырмаланат.",
    q11: "Калдыктарды кайра иштетүү фактысын кантип ырастоо керек?", a11: "Кайра иштетүү фактысын ырастоо үчүн лицензиясы бар кайра иштетүүчү менен келишим түзүп, кабыл алуу-өткөрүп берүү актысын алышыңыз керек.",
    q12: "Лицензиясы бар кайра иштетүүчүлөрдүн тизмесин кайдан тапса болот?", a12: "Лицензиясы бар кайра иштетүүчүлөрдүн реестри АМС ЦРО порталынын «Реестрлер» бөлүмүндө жеткиликтүү.",
    q13: "РӨЖ алкагында калдыктардын кандай түрлөрү кайра иштетилиши керек?", a13: "РӨЖ алкагында таңгак, шиналар, аккумуляторлор, электрондук жабдуулар, майлар кайра иштетилиши керек.",
    q14: "Калдыктарды кайра иштетүүгө лицензияны кантип алса болот?", a14: "Лицензия алуу үчүн ЖРЭТК КР га арыз берип, тийиштүү документтерди тапшырыш керек. Кароо мөөнөтү — 30 жумуш күнү.",
    q15: "Кайра иштетүүчүлөргө кандай талаптар коюлат?", a15: "Негизги талаптар: ЖРЭТК лицензиясы, экологиялык ченемдерге ылайык жабдуулар, АМС ЦРО да отчёттуулук.",
    q16: "Лицензияны тоготууга же жокко чыгарууга болобу?", a16: "Лицензия лицензиялоо шарттарын бузган учурда тоготулушу же жокко чыгарылышы мүмкүн.",
    q17: "Кайра иштетүү лицензиясы канча турат?", a17: "Лицензиялык жыйымдын өлчөмү ишмердүүлүктүн түрүнө жараша: ТКК кайра иштетүү — 5 000 сом, өнөр жай калдыктары — 10 000 сом, коркунучтуу калдыктар — 20 000 сом.",
    q18: "АМС ЦРО да кандай отчётторду берүү керек?", a18: "АМС ЦРО аркылуу чейректик эсептөө, жылдык декларация, кайра иштетүү отчёту берилет.",
    q19: "Отчёттуулукту берүү мөөнөттөрү кандай?", a19: "Чейректик эсептөө — чейректен кийинки айдын 20сүнө чейин, жылдык декларация — кийинки жылдын 1 мартына чейин.",
    q20: "Отчёттуулукту бербегендик үчүн эмне болот?", a20: "Биринчи бузуу учурунда эскертүү, кайталангандыгы учурунда 5 000ден 20 000 сомго чейин айып салынат.",
    q21: "Берилген отчёттогу катаны кантип оңдоо керек?", a21: "Ката оңдоо үчүн жеке кабинеттен документти таап, тууралоочу документ түзүп, кайра текшерүүгө жөнөтүңүз.",
    q22: "Отчёттуулук формаларын кайдан жүктөп алса болот?", a22: "Отчёттуулук формалары АМС ЦРО жеке кабинетинде автоматтык түрдө түзүлөт."
  }
}

const legalBaseEn = {
  title: "Legal and Regulatory Framework",
  subtitle: "Complete database of legal and regulatory acts in the field of waste management and extended producer responsibility, along with frequently asked questions",
  tabNpa: "Regulatory Acts",
  tabFaq: "FAQ",
  searchNpa: "Search by title, number or description...",
  searchFaq: "Search questions and answers...",
  allDocuments: "All documents",
  allQuestions: "All questions",
  found: "Found",
  noResults: "No results found",
  tryDifferentQuery: "Try changing the search query or filter",
  viewOnSite: "View source",
  categories: {
    laws: "KR Laws",
    decrees: "Government Decrees",
    regulations: "Departmental Orders",
    technical: "Technical Standards",
    international: "International Agreements"
  },
  faqCategories: {
    general: "General Questions",
    payment: "Utilization Fee",
    recycling: "Waste Recycling",
    licensing: "Licensing",
    reporting: "Reporting & Declarations"
  },
  docs: {
    d1: { title: "KR Law \"On Production and Consumption Waste\"", desc: "The main law regulating legal relations in the field of production and consumption waste management in the Kyrgyz Republic." },
    d2: { title: "KR Law \"On Environmental Protection\"", desc: "Defines the legal basis for environmental protection, ensuring ecological safety, and preventing harmful impact." },
    d3: { title: "KR Law \"On Environmental Expertise\"", desc: "Establishes the procedure for conducting environmental expertise of economic activity projects and facilities." },
    d4: { title: "KR Law \"On the Procedure for Reviewing Citizens' Appeals\"", desc: "Regulates the procedure for submitting and reviewing citizens' appeals by state bodies. Review period — 30 calendar days." },
    d5: { title: "KR Law \"On Technical Regulation\"", desc: "Defines technical safety requirements for products, including packaging and waste." },
    d6: { title: "KR Law \"On Extended Producer (Importer) Responsibility\"", desc: "Establishes the mechanism of extended responsibility of producers and importers for the disposal of goods and packaging after loss of consumer properties." },
    d7: { title: "KR Government Decree \"On Utilization Fee Rates\"", desc: "Approves utilization fee rates by product groups and recycling standards." },
    d8: { title: "KR Government Decree \"On the Procedure for Paying the Utilization Fee\"", desc: "Determines the procedure for calculating, paying and administering the utilization fee." },
    d9: { title: "KR Government Decree \"On Approval of the Regulation on SE Eco Operator\"", desc: "Approves the regulation on the state enterprise 'Eco Operator' — the administrator of the EPR system." },
    d10: { title: "KR Government Decree \"On the Registry of Utilization Fee Payers\"", desc: "Determines the procedure for maintaining the Registry of utilization fee payers and registration requirements." },
    d11: { title: "KR Government Decree \"On Digitalization of the EPR System\"", desc: "Approves the transition plan to the digital platform AIS 'Digital Waste Registry' for automation of EPR processes." },
    d12: { title: "MNRETS Order \"On Approval of Reporting Forms\"", desc: "Approves quarterly and annual reporting forms on waste management for enterprises." },
    d13: { title: "MNRETS Order \"On Licensing Procedure for Waste Recycling Activities\"", desc: "Regulates the procedure for issuing, suspending and revoking licenses for waste recycling activities." },
    d14: { title: "MNRETS Order \"On Approval of the Utilization Fee Calculation Methodology\"", desc: "Establishes the methodology for calculating the utilization fee, calculation formulas and the procedure for determining the taxable volume." },
    d15: { title: "MNRETS Order \"On the Procedure for Returning the Utilization Fee\"", desc: "Determines the conditions, procedure and deadlines for returning the utilization fee to recyclers when standards are met." },
    d16: { title: "MNRETS Order \"On Approval of the KR Waste Classifier\"", desc: "Approves the waste classifier by types, hazard classes and sources of generation." },
    d17: { title: "Sanitary Rules and Norms for Waste Management", desc: "Hygienic requirements for the placement and neutralization of production and consumption waste." },
    d18: { title: "ISO 14001 Standard — Environmental Management Systems", desc: "International standard establishing requirements for environmental management systems for organizations." },
    d19: { title: "GOST 30772-2001 — Resource Conservation. Waste Management. Terms and Definitions", desc: "Interstate standard defining basic terms and definitions in the field of waste management." },
    d20: { title: "EAEU Technical Regulation \"On Restriction of Hazardous Substances\"", desc: "Regulates the restriction of use of hazardous substances in electrical and electronic equipment." },
    d21: { title: "Basel Convention on Transboundary Movements of Hazardous Wastes", desc: "International convention on the control of transboundary movements of hazardous wastes and their disposal. KR acceded in 1996." },
    d22: { title: "Stockholm Convention on Persistent Organic Pollutants", desc: "Convention aimed at eliminating or restricting the production and use of persistent organic pollutants." },
    d23: { title: "Aarhus Convention on Access to Environmental Information", desc: "Convention on access to information, public participation in decision-making and access to justice in environmental matters." },
    d24: { title: "UN Sustainable Development Goals — Goal 12", desc: "SDG 12: Responsible Consumption and Production. Ensuring the transition to sustainable consumption and production patterns." },
    d25: { title: "EAEU Agreement on Environmental Policy Coordination", desc: "Agreement of EAEU member states on coordination of approaches to environmental regulation and waste management." }
  },
  faq: {
    q1: "What is Extended Producer Responsibility (EPR)?", a1: "Extended Producer Responsibility (EPR) is an environmental policy principle under which producers and importers of goods are responsible for the disposal of their products and packaging after loss of consumer properties. In Kyrgyzstan, the EPR mechanism is implemented through payment of the utilization fee to SE 'Eco Operator'.",
    q2: "What is AIS 'Digital Waste Registry'?", a2: "AIS 'Digital Waste Registry' is an automated information system for accounting and controlling waste management in the Kyrgyz Republic.",
    q3: "Who should register in the system?", a3: "The following must register:\n• Producers of goods and packaging in KR\n• Importers of goods and packaging to KR\n• Organizations engaged in waste recycling\n• Landfill operators and collection points",
    q4: "What roles exist in the system?", a4: "The system provides the following roles:\n• Payer — producer or importer obligated to pay the utilization fee\n• Eco Operator — SE 'Eco Operator', EPR system administrator\n• MNRETS Employee — Ministry specialist\n• Administrator — system administrator",
    q5: "Who is obligated to pay the utilization fee?", a5: "Producers of goods and packaging registered in KR and importers of goods and packaging into KR are obligated to pay the utilization fee.",
    q6: "How is the utilization fee calculated?", a6: "The utilization fee is calculated using the formula:\n\nAmount = Volume (tons) × Recycling Standard (%) × Rate (som/ton)",
    q7: "What are the deadlines for paying the utilization fee?", a7: "The utilization fee is paid quarterly:\n• Q1 — by April 25\n• Q2 — by July 25\n• Q3 — by October 25\n• Q4 — by January 25 of the following year",
    q8: "What happens if the utilization fee is not paid on time?", a8: "A penalty of 0.1% of the debt amount is charged for each day of delay. The maximum penalty cannot exceed 50% of the principal debt.",
    q9: "Can the paid utilization fee be refunded?", a9: "Yes, a refund is possible when:\n• The recycler has met recycling standards\n• Erroneous or excessive payment\n• Export of goods from KR after fee payment",
    q10: "What recycling standards are in effect?", a10: "Recycling standards are established by KR Government decree and vary by product groups.",
    q11: "How to confirm the fact of waste recycling?", a11: "To confirm recycling, you need to sign a contract with a licensed recycler and obtain an acceptance-transfer act.",
    q12: "Where to find the list of licensed recyclers?", a12: "The registry of licensed recyclers is available in the 'Registries' section of the AIS portal.",
    q13: "What types of waste are subject to recycling under EPR?", a13: "Under EPR, packaging, tires, batteries, electronic equipment, and oils are subject to recycling.",
    q14: "How to obtain a waste recycling license?", a14: "To obtain a license, submit an application to MNRETS KR with the required documents. Review period — up to 30 working days.",
    q15: "What requirements are imposed on recyclers?", a15: "Main requirements: MNRETS license, equipment compliant with environmental standards, reporting in AIS.",
    q16: "Can a license be suspended or revoked?", a16: "A license may be suspended or revoked in cases of violation of licensing conditions.",
    q17: "How much does a recycling license cost?", a17: "License fee depends on the type of activity: MSW recycling — 5,000 som, industrial waste — 10,000 som, hazardous waste — 20,000 som.",
    q18: "What reports need to be submitted in AIS?", a18: "Quarterly calculation of utilization fee, annual declaration, and recycling reports are submitted through AIS.",
    q19: "What are the reporting deadlines?", a19: "Quarterly calculation — by the 20th of the month following the quarter, annual declaration — by March 1 of the following year.",
    q20: "What happens for failure to provide reporting?", a20: "A warning for the first violation, a fine of 5,000 to 20,000 som for repeated violations.",
    q21: "How to correct an error in a submitted report?", a21: "Find the document in your personal account, create a corrective document, and submit it for re-review.",
    q22: "Where to download reporting forms?", a22: "Reporting forms are automatically generated in the AIS personal account."
  }
}

// Additional nav and breadcrumb keys
const navAdditions = {
  ru: { legalBase: "Нормативная база" },
  ky: { legalBase: "Ченемдик база" },
  en: { legalBase: "Legal Base" }
}

const breadcrumbAdditions = {
  ru: { legalBase: "Нормативно-правовая база" },
  ky: { legalBase: "Ченемдик-укуктук база" },
  en: { legalBase: "Legal and Regulatory Framework" }
}

function patchLocale(filename, lang) {
  const filepath = resolve(localesDir, filename)
  const data = JSON.parse(readFileSync(filepath, 'utf-8'))

  const lbData = lang === 'ru' ? legalBaseRu : lang === 'ky' ? legalBaseKy : legalBaseEn
  data.legalBase = lbData

  if (!data.nav) data.nav = {}
  Object.assign(data.nav, navAdditions[lang])

  if (!data.breadcrumb) data.breadcrumb = {}
  Object.assign(data.breadcrumb, breadcrumbAdditions[lang])

  writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  console.log(`Patched ${filename}: added legalBase section + nav/breadcrumb keys`)
}

patchLocale('ru.json', 'ru')
patchLocale('ky.json', 'ky')
patchLocale('en.json', 'en')

console.log('All locales patched successfully!')
