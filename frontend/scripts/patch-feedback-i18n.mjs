import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = resolve(__dirname, '../src/locales')

// Feedback keys for all 3 languages
const feedbackRu = {
  system: "Система",
  formTitle: "Обращение граждан",
  formDescription: "Заполните форму для подачи обращения в Министерство природных ресурсов, экологии и технического надзора КР",
  personalInfo: "Данные заявителя",
  requestInfo: "Информация об обращении",
  attachments: "Прикреплённые файлы",
  selectFiles: "Выберите файлы (до 5 файлов)",
  maxFiles: "Максимум 5 файлов. Форматы: PDF, JPG, PNG, DOC, DOCX",
  location: "Геолокация",
  locationHint: "Укажите место на карте, если обращение связано с конкретной локацией",
  locationSelected: "Местоположение выбрано",
  selectOnMap: "Указать на карте",
  changeLocation: "Изменить местоположение",
  submit: "Отправить обращение",
  checkStatusLink: "Проверить статус обращения",
  successTitle: "Обращение отправлено!",
  successDescription: "Ваше обращение принято и будет рассмотрено в течение 30 календарных дней в соответствии с Законом КР «О порядке рассмотрения обращений граждан».",
  yourTicketNumber: "Номер вашего обращения",
  successEmailNotice: "Уведомление отправлено на {email}",
  checkStatus: "Проверить статус",
  backToHome: "На главную",
  statusTitle: "Проверка статуса обращения",
  statusDescription: "Введите номер обращения и email для проверки текущего статуса",
  search: "Найти",
  newRequest: "Подать обращение",
  ticketNumber: "Номер обращения",
  createdAt: "Дата подачи",
  officialResponse: "Официальный ответ",
  respondedAt: "Дата ответа",
  comments: "Комментарии",
  timeline: "История изменений",
  selectCategory: "Выберите категорию",
  allStatuses: "Все статусы",
  allCategories: "Все категории",
  searchPlaceholder: "Поиск по номеру, ФИО или теме...",
  dateFrom: "Дата от",
  dateTo: "Дата до",
  noItems: "Обращений не найдено",
  noItemsHint: "Попробуйте изменить параметры фильтра",
  days: "дн.",
  daysElapsed: "дн. прошло",
  daysRemaining: "осталось {days} дн.",
  exportExcel: "Экспорт в Excel",
  exportStarted: "Формирование отчёта начато",
  employeeTitle: "Обращения граждан",
  employeeDescription: "Управление обращениями граждан (Закон КР №67 от 04.05.2007)",
  requestContent: "Содержание обращения",
  responseToApplicant: "Ответ заявителю",
  sendResponse: "Отправить ответ",
  updateResponse: "Обновить ответ",
  responseSent: "Ответ отправлен",
  internalComments: "Внутренние комментарии",
  onlyForEmployees: "(видны только сотрудникам)",
  internal: "Внутренний",
  noComments: "Комментариев пока нет",
  addComment: "Добавить",
  commentAdded: "Комментарий добавлен",
  applicantInfo: "Информация о заявителе",
  changeStatus: "Изменить статус",
  applyStatus: "Применить",
  statusUpdated: "Статус обновлён",
  slaDeadline: "Срок рассмотрения (30 дней)",
  assignedTo: "Ответственный",
  takeInWork: "Взять в работу",
  takenInWork: "Обращение принято в работу",
  notFound: "Обращение не найдено",
  backToList: "Вернуться к списку",
  categories: {
    complaint: "Жалоба",
    suggestion: "Предложение",
    infoRequest: "Запрос информации",
    violationReport: "Сообщение о нарушении"
  },
  fields: {
    fullName: "ФИО",
    phone: "Телефон",
    email: "Электронная почта",
    category: "Категория",
    subject: "Тема обращения",
    message: "Текст обращения",
    ticketNumber: "Номер обращения"
  },
  placeholders: {
    fullName: "Иванов Иван Иванович",
    phone: "+996 XXX XXXXXX",
    email: "example@mail.kg",
    subject: "Краткая тема обращения",
    message: "Подробно опишите суть вашего обращения...",
    ticketNumber: "OBR-2026-XXXXX",
    emailForStatus: "Email, указанный при подаче",
    response: "Введите текст ответа заявителю...",
    internalComment: "Внутренний комментарий..."
  },
  errors: {
    fullNameRequired: "Укажите ФИО",
    phoneRequired: "Укажите телефон",
    emailRequired: "Укажите email",
    emailInvalid: "Неверный формат email",
    categoryRequired: "Выберите категорию",
    subjectRequired: "Укажите тему",
    messageRequired: "Введите текст обращения",
    fillBothFields: "Заполните оба поля",
    ticketNotFound: "Обращение не найдено. Проверьте номер и email."
  },
  stats: {
    total: "Всего обращений",
    new: "Новые",
    inProgress: "В работе",
    resolved: "Решённые"
  },
  table: {
    number: "Номер",
    date: "Дата",
    category: "Категория",
    subject: "Тема",
    applicant: "Заявитель",
    region: "Регион",
    status: "Статус",
    sla: "Срок"
  }
}

const feedbackKy = {
  system: "Система",
  formTitle: "Жарандардын кайрылуулары",
  formDescription: "Кыргыз Республикасынын Жаратылыш ресурстары, экология жана техникалык көзөмөл министрлигине кайрылуу берүү үчүн форманы толтуруңуз",
  personalInfo: "Арыз берүүчүнүн маалыматтары",
  requestInfo: "Кайрылуу жөнүндө маалымат",
  attachments: "Тиркелген файлдар",
  selectFiles: "Файлдарды тандаңыз (5ке чейин)",
  maxFiles: "Эң көп 5 файл. Форматтар: PDF, JPG, PNG, DOC, DOCX",
  location: "Геолокация",
  locationHint: "Кайрылуу белгилүү бир жерге байланыштуу болсо, картадан көрсөтүңүз",
  locationSelected: "Жайгашуу тандалды",
  selectOnMap: "Картадан көрсөтүү",
  changeLocation: "Жайгашууну өзгөртүү",
  submit: "Кайрылууну жөнөтүү",
  checkStatusLink: "Кайрылуунун статусун текшерүү",
  successTitle: "Кайрылуу жөнөтүлдү!",
  successDescription: "Сиздин кайрылууңуз кабыл алынды жана КР «Жарандардын кайрылууларын кароо тартиби жөнүндө» Мыйзамына ылайык 30 календардык күндүн ичинде каралат.",
  yourTicketNumber: "Кайрылууңуздун номери",
  successEmailNotice: "{email} дарегине билдирүү жөнөтүлдү",
  checkStatus: "Статусту текшерүү",
  backToHome: "Башкы бетке",
  statusTitle: "Кайрылуунун статусун текшерүү",
  statusDescription: "Учурдагы статусту текшерүү үчүн кайрылуунун номерин жана электрондук почтаны киргизиңиз",
  search: "Издөө",
  newRequest: "Кайрылуу берүү",
  ticketNumber: "Кайрылуу номери",
  createdAt: "Берилген күнү",
  officialResponse: "Расмий жооп",
  respondedAt: "Жооп берилген күнү",
  comments: "Комментарийлер",
  timeline: "Өзгөрүүлөр тарыхы",
  selectCategory: "Категорияны тандаңыз",
  allStatuses: "Бардык статустар",
  allCategories: "Бардык категориялар",
  searchPlaceholder: "Номер, аты-жөнү же темасы боюнча издөө...",
  dateFrom: "Күндөн",
  dateTo: "Күнгө чейин",
  noItems: "Кайрылуулар табылган жок",
  noItemsHint: "Фильтр параметрлерин өзгөртүп көрүңүз",
  days: "күн",
  daysElapsed: "күн өттү",
  daysRemaining: "{days} күн калды",
  exportExcel: "Excel'ге экспорт",
  exportStarted: "Отчёт түзүү башталды",
  employeeTitle: "Жарандардын кайрылуулары",
  employeeDescription: "Жарандардын кайрылууларын башкаруу (КР Мыйзамы №67, 04.05.2007)",
  requestContent: "Кайрылуунун мазмуну",
  responseToApplicant: "Арыз берүүчүгө жооп",
  sendResponse: "Жооп жөнөтүү",
  updateResponse: "Жоопту жаңыртуу",
  responseSent: "Жооп жөнөтүлдү",
  internalComments: "Ички комментарийлер",
  onlyForEmployees: "(кызматкерлерге гана көрүнөт)",
  internal: "Ички",
  noComments: "Комментарийлер жок",
  addComment: "Кошуу",
  commentAdded: "Комментарий кошулду",
  applicantInfo: "Арыз берүүчү жөнүндө маалымат",
  changeStatus: "Статусту өзгөртүү",
  applyStatus: "Колдонуу",
  statusUpdated: "Статус жаңыртылды",
  slaDeadline: "Кароо мөөнөтү (30 күн)",
  assignedTo: "Жооптуу",
  takeInWork: "Иштөөгө алуу",
  takenInWork: "Кайрылуу иштөөгө алынды",
  notFound: "Кайрылуу табылган жок",
  backToList: "Тизмеге кайтуу",
  categories: {
    complaint: "Даттануу",
    suggestion: "Сунуш",
    infoRequest: "Маалымат суроо",
    violationReport: "Мыйзам бузуу жөнүндө билдирүү"
  },
  fields: {
    fullName: "Аты-жөнү",
    phone: "Телефон",
    email: "Электрондук почта",
    category: "Категория",
    subject: "Кайрылуунун темасы",
    message: "Кайрылуунун тексти",
    ticketNumber: "Кайрылуу номери"
  },
  placeholders: {
    fullName: "Иванов Иван Иванович",
    phone: "+996 XXX XXXXXX",
    email: "example@mail.kg",
    subject: "Кайрылуунун кыскача темасы",
    message: "Кайрылууңуздун маңызын толук сүрөттөңүз...",
    ticketNumber: "OBR-2026-XXXXX",
    emailForStatus: "Кайрылуу берүүдө көрсөтүлгөн Email",
    response: "Арыз берүүчүгө жооп текстин киргизиңиз...",
    internalComment: "Ички комментарий..."
  },
  errors: {
    fullNameRequired: "Аты-жөнүн көрсөтүңүз",
    phoneRequired: "Телефон көрсөтүңүз",
    emailRequired: "Email көрсөтүңүз",
    emailInvalid: "Email форматы туура эмес",
    categoryRequired: "Категория тандаңыз",
    subjectRequired: "Теманы көрсөтүңүз",
    messageRequired: "Кайрылуунун текстин киргизиңиз",
    fillBothFields: "Эки талааны тең толтуруңуз",
    ticketNotFound: "Кайрылуу табылган жок. Номерди жана emailди текшериңиз."
  },
  stats: {
    total: "Бардык кайрылуулар",
    new: "Жаңы",
    inProgress: "Иштелүүдө",
    resolved: "Чечилген"
  },
  table: {
    number: "Номер",
    date: "Күнү",
    category: "Категория",
    subject: "Тема",
    applicant: "Арыз берүүчү",
    region: "Аймак",
    status: "Статус",
    sla: "Мөөнөт"
  }
}

const feedbackEn = {
  system: "System",
  formTitle: "Citizen Feedback",
  formDescription: "Fill out the form to submit a request to the Ministry of Natural Resources, Ecology and Technical Supervision of the Kyrgyz Republic",
  personalInfo: "Applicant Information",
  requestInfo: "Request Information",
  attachments: "Attached Files",
  selectFiles: "Select files (up to 5)",
  maxFiles: "Maximum 5 files. Formats: PDF, JPG, PNG, DOC, DOCX",
  location: "Geolocation",
  locationHint: "Mark a location on the map if the request is related to a specific area",
  locationSelected: "Location selected",
  selectOnMap: "Select on map",
  changeLocation: "Change location",
  submit: "Submit Request",
  checkStatusLink: "Check request status",
  successTitle: "Request Submitted!",
  successDescription: "Your request has been received and will be reviewed within 30 calendar days in accordance with the KR Law \"On the Procedure for Reviewing Citizens' Appeals\".",
  yourTicketNumber: "Your request number",
  successEmailNotice: "Notification sent to {email}",
  checkStatus: "Check Status",
  backToHome: "Back to Home",
  statusTitle: "Check Request Status",
  statusDescription: "Enter the request number and email to check the current status",
  search: "Search",
  newRequest: "Submit Request",
  ticketNumber: "Request Number",
  createdAt: "Date Submitted",
  officialResponse: "Official Response",
  respondedAt: "Response Date",
  comments: "Comments",
  timeline: "Status History",
  selectCategory: "Select category",
  allStatuses: "All statuses",
  allCategories: "All categories",
  searchPlaceholder: "Search by number, name or subject...",
  dateFrom: "Date from",
  dateTo: "Date to",
  noItems: "No requests found",
  noItemsHint: "Try changing the filter parameters",
  days: "days",
  daysElapsed: "days elapsed",
  daysRemaining: "{days} days remaining",
  exportExcel: "Export to Excel",
  exportStarted: "Report generation started",
  employeeTitle: "Citizen Requests",
  employeeDescription: "Management of citizen requests (KR Law No. 67 of 05/04/2007)",
  requestContent: "Request Content",
  responseToApplicant: "Response to Applicant",
  sendResponse: "Send Response",
  updateResponse: "Update Response",
  responseSent: "Response sent",
  internalComments: "Internal Comments",
  onlyForEmployees: "(visible to employees only)",
  internal: "Internal",
  noComments: "No comments yet",
  addComment: "Add",
  commentAdded: "Comment added",
  applicantInfo: "Applicant Information",
  changeStatus: "Change Status",
  applyStatus: "Apply",
  statusUpdated: "Status updated",
  slaDeadline: "Review deadline (30 days)",
  assignedTo: "Assigned to",
  takeInWork: "Take in work",
  takenInWork: "Request taken in work",
  notFound: "Request not found",
  backToList: "Back to list",
  categories: {
    complaint: "Complaint",
    suggestion: "Suggestion",
    infoRequest: "Information Request",
    violationReport: "Violation Report"
  },
  fields: {
    fullName: "Full Name",
    phone: "Phone",
    email: "Email",
    category: "Category",
    subject: "Subject",
    message: "Message",
    ticketNumber: "Request Number"
  },
  placeholders: {
    fullName: "John Doe",
    phone: "+996 XXX XXXXXX",
    email: "example@mail.kg",
    subject: "Brief subject of the request",
    message: "Describe the details of your request...",
    ticketNumber: "OBR-2026-XXXXX",
    emailForStatus: "Email provided when submitting",
    response: "Enter response text for the applicant...",
    internalComment: "Internal comment..."
  },
  errors: {
    fullNameRequired: "Full name is required",
    phoneRequired: "Phone is required",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email format",
    categoryRequired: "Please select a category",
    subjectRequired: "Subject is required",
    messageRequired: "Message is required",
    fillBothFields: "Fill in both fields",
    ticketNotFound: "Request not found. Check the number and email."
  },
  stats: {
    total: "Total Requests",
    new: "New",
    inProgress: "In Progress",
    resolved: "Resolved"
  },
  table: {
    number: "Number",
    date: "Date",
    category: "Category",
    subject: "Subject",
    applicant: "Applicant",
    region: "Region",
    status: "Status",
    sla: "Deadline"
  }
}

// Additional keys to add to nav, status, breadcrumb sections
const navAdditions = {
  ru: { feedback: "Обратная связь" },
  ky: { feedback: "Кайрылуу" },
  en: { feedback: "Feedback" }
}

const navEmployeeAdditions = {
  ru: { feedback: "Обращения граждан" },
  ky: { feedback: "Жарандардын кайрылуулары" },
  en: { feedback: "Citizen Requests" }
}

const statusAdditions = {
  ru: { inProgress: "В работе", resolved: "Решено" },
  ky: { inProgress: "Иштелүүдө", resolved: "Чечилди" },
  en: { inProgress: "In Progress", resolved: "Resolved" }
}

const breadcrumbAdditions = {
  ru: { feedback: "Обратная связь", feedbackStatus: "Проверка статуса обращения", employeeFeedback: "Обращения граждан", feedbackDetail: "Карточка обращения" },
  ky: { feedback: "Кайрылуу", feedbackStatus: "Кайрылуу статусун текшерүү", employeeFeedback: "Жарандардын кайрылуулары", feedbackDetail: "Кайрылуу картасы" },
  en: { feedback: "Feedback", feedbackStatus: "Check Request Status", employeeFeedback: "Citizen Requests", feedbackDetail: "Request Details" }
}

function patchLocale(filename, lang) {
  const filepath = resolve(localesDir, filename)
  const data = JSON.parse(readFileSync(filepath, 'utf-8'))

  // Add feedback section
  const feedbackData = lang === 'ru' ? feedbackRu : lang === 'ky' ? feedbackKy : feedbackEn
  data.feedback = feedbackData

  // Add nav.feedback
  if (!data.nav) data.nav = {}
  Object.assign(data.nav, navAdditions[lang])

  // Add nav.employee.feedback
  if (!data.nav.employee) data.nav.employee = {}
  Object.assign(data.nav.employee, navEmployeeAdditions[lang])

  // Add status keys (won't overwrite existing)
  if (!data.status) data.status = {}
  for (const [key, val] of Object.entries(statusAdditions[lang])) {
    if (!data.status[key]) data.status[key] = val
  }

  // Add breadcrumb keys
  if (!data.breadcrumb) data.breadcrumb = {}
  Object.assign(data.breadcrumb, breadcrumbAdditions[lang])

  writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  console.log(`Patched ${filename}: added feedback section + nav/status/breadcrumb keys`)
}

patchLocale('ru.json', 'ru')
patchLocale('ky.json', 'ky')
patchLocale('en.json', 'en')

console.log('All locales patched successfully!')
