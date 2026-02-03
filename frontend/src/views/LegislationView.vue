<script setup lang="ts">
interface Document {
  id: number
  name: string
  date: string
  fileName: string
  fileType: 'doc' | 'docx' | 'pdf'
}

// Law documents with actual files
const documents: Document[] = [
  {
    id: 1,
    name: 'Закон КР «Об отходах производства и потребления» №181',
    date: '15.08.2023',
    fileName: 'zakon-181-ob-othodah.docx',
    fileType: 'docx'
  },
  {
    id: 2,
    name: 'ПКБ КР №322 от 19.06.2024 «О группах товаров и упаковки» (24 группы и подгруппы)',
    date: '19.06.2024',
    fileName: 'pkb-322-gruppy.doc',
    fileType: 'doc'
  },
  {
    id: 3,
    name: 'ПКМ КР №545 от 06.09.2024',
    date: '06.09.2024',
    fileName: 'pkm-545.doc',
    fileType: 'doc'
  },
  {
    id: 4,
    name: 'ПКМ КР №545 «Положение о декларировании производителями и импортёрами товаров»',
    date: '06.09.2024',
    fileName: 'pkm-545-deklarirovanie.doc',
    fileType: 'doc'
  },
  {
    id: 5,
    name: 'ПКМ КР №563 от 13.09.2024 «Порядок представления отчётности производителями и импортёрами»',
    date: '13.09.2024',
    fileName: 'pkm-563-otchetnost.doc',
    fileType: 'doc'
  },
  {
    id: 6,
    name: 'ПКМ КР №730 от 03.12.2024 «Порядок уплаты утилизационного сбора»',
    date: '03.12.2024',
    fileName: 'pkm-730-poryadok-uplaty.doc',
    fileType: 'doc'
  },
  {
    id: 7,
    name: 'Порядок лицензирования переработчиков отходов',
    date: '19.11.2024',
    fileName: 'pererabotchiki-licenzii.docx',
    fileType: 'docx'
  },
  {
    id: 8,
    name: 'Форма декларации и инструкция по заполнению',
    date: '20.11.2024',
    fileName: 'forma-deklaracii-instrukciya.docx',
    fileType: 'docx'
  },
]

const getFilePath = (doc: Document): string => {
  return `/docs/laws/${doc.fileName}`
}

const getFullUrl = (doc: Document): string => {
  return window.location.origin + getFilePath(doc)
}

const handleView = (doc: Document) => {
  if (doc.fileType === 'pdf') {
    // PDF files - open directly in browser's built-in viewer
    window.open(getFilePath(doc), '_blank')
  } else {
    // DOC/DOCX files - use Google Docs Viewer
    const fullUrl = getFullUrl(doc)
    const viewerUrl = 'https://docs.google.com/gview?url=' + encodeURIComponent(fullUrl) + '&embedded=true'
    window.open(viewerUrl, '_blank')
  }
}

const handleDownload = (doc: Document) => {
  // Force download
  const link = document.createElement('a')
  link.href = getFilePath(doc)
  link.download = doc.fileName
  link.click()
}
</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <!-- Page header -->
    <div class="container-main">
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-3 lg:mb-[12px]">
        Законодательство
      </h1>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861] mb-8 lg:mb-[60px]">
        Нормативные правовые акты в сфере обращения с отходами
      </p>
    </div>

    <!-- Table section -->
    <div class="container-main">
      <!-- Desktop table -->
      <div class="hidden lg:block">
        <div class="bg-[#f5f5f5] flex flex-col gap-px">
          <!-- Table header -->
          <div class="flex gap-px">
            <div class="bg-[#f8fafc] flex items-center justify-center px-5 py-4 w-[68px]">
              <span class="text-[24px] font-medium text-black">№</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center px-5 py-4 flex-1">
              <span class="text-[18px] font-medium text-black">Наименование документа</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center justify-center px-5 py-4 w-[150px]">
              <span class="text-[18px] font-medium text-black">Дата</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center justify-center px-3 py-4 w-[200px]">
              <span class="text-[18px] font-medium text-black">Действия</span>
            </div>
          </div>

          <!-- Table rows -->
          <div
            v-for="(doc, index) in documents"
            :key="doc.id"
            class="flex gap-px"
          >
            <div class="bg-white flex items-center justify-center px-5 py-4 w-[68px]">
              <span class="text-[18px] font-medium text-black">{{ index + 1 }}</span>
            </div>
            <div class="bg-white flex items-center px-5 py-4 flex-1">
              <span class="text-[18px] font-medium text-black">{{ doc.name }}</span>
            </div>
            <div class="bg-white flex items-center justify-center px-5 py-4 w-[150px]">
              <span class="text-[18px] font-medium text-black">{{ doc.date }}</span>
            </div>
            <div class="bg-white flex items-center justify-center px-3 py-4 w-[200px]">
              <div class="flex gap-[6px]">
                <button
                  @click="handleView(doc)"
                  class="bg-[#0e888d] text-white text-[12px] font-medium px-[10px] py-[8px] rounded-[12px] hover:bg-[#0a6d71] transition-colors"
                >
                  Смотреть
                </button>
                <button
                  @click="handleDownload(doc)"
                  class="bg-[#fea629] text-white text-[12px] font-medium px-[10px] py-[8px] rounded-[12px] hover:bg-[#e59520] transition-colors"
                >
                  Скачать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile/Tablet cards -->
      <div class="lg:hidden flex flex-col gap-4">
        <div
          v-for="(doc, index) in documents"
          :key="doc.id"
          class="bg-white border border-[#f5f5f5] rounded-[20px] p-5 shadow-sm"
        >
          <div class="flex items-start gap-3 mb-3">
            <span class="bg-[#f8fafc] text-[#415861] font-medium text-sm px-3 py-1 rounded-lg">
              {{ index + 1 }}
            </span>
            <span class="text-[#415861] font-medium text-sm">{{ doc.date }}</span>
          </div>
          <h3 class="text-[#415861] font-medium text-base mb-4">
            {{ doc.name }}
          </h3>
          <div class="flex gap-3">
            <button
              @click="handleView(doc)"
              class="bg-[#0e888d] text-white text-sm font-medium px-4 py-2 rounded-[12px] hover:bg-[#0a6d71] transition-colors flex-1"
            >
              Смотреть
            </button>
            <button
              @click="handleDownload(doc)"
              class="bg-[#fea629] text-white text-sm font-medium px-4 py-2 rounded-[12px] hover:bg-[#e59520] transition-colors flex-1"
            >
              Скачать
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
