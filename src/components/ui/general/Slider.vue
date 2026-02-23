<template>
    <div class="slider" :style="{ height: height }">
        <div class="slider__track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div
                v-for="(slide, index) in slides"
                :key="index"
                class="slider__slide"
            >
                <slot name="slide" :slide="slide" :index="index" :is-active="currentSlide === index" />
            </div>
        </div>


        <button
            v-if="showArrows"
            class="slider__arrow slider__arrow--prev"
            :disabled="currentSlide === 0 && !loop"
            @click="prevSlide"
        >
            <slot name="arrow-prev">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M15 18L9 12L15 6" stroke="white"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    />
                </svg>
            </slot>
        </button>

        <button
            v-if="showArrows"
            class="slider__arrow slider__arrow--next"
            :disabled="currentSlide === slides.length - 1 && !loop"
            @click="nextSlide"
        >
            <slot name="arrow-next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M9 18L15 12L9 6" stroke="white"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    />
                </svg>
            </slot>
        </button>


        <div v-if="showPagination" class="slider__pagination">
            <button
                v-for="(_slide, index) in slides"
                :key="index"
                class="slider__pagination-dot"
                :class="{ 'slider__pagination-dot--active': currentSlide === index }"
                @click="goToSlide(index)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

defineOptions({
    name: 'Slider',
})

interface Props {
    slides: any[];
    autoplay?: boolean;
    autoplayDelay?: number;
    loop?: boolean;
    showArrows?: boolean;
    showPagination?: boolean;
    height?: string;
}

const props = withDefaults(defineProps<Props>(), {
    autoplay: true,
    autoplayDelay: 5000,
    loop: true,
    showArrows: true,
    showPagination: true,
    height: '600px',
})

const emit = defineEmits<{
    (e: 'slide-change', slideIndex: number): void;
}>()

const currentSlide = ref(0)
let autoplayInterval: number | null = null

const nextSlide = () => {
    if (currentSlide.value < props.slides.length - 1) {
        currentSlide.value++
    } else if (props.loop) {
        currentSlide.value = 0
    }
    emit('slide-change', currentSlide.value)
}

const prevSlide = () => {
    if (currentSlide.value > 0) {
        currentSlide.value--
    } else if (props.loop) {
        currentSlide.value = props.slides.length - 1
    }
    emit('slide-change', currentSlide.value)
}

const goToSlide = (index: number) => {
    currentSlide.value = index
    emit('slide-change', currentSlide.value)
    resetAutoplay()
}

const startAutoplay = () => {
    if (props.autoplay && props.slides.length > 1) {
        autoplayInterval = window.setInterval(() => {
            nextSlide()
        }, props.autoplayDelay)
    }
}

const stopAutoplay = () => {
    if (autoplayInterval) {
        clearInterval(autoplayInterval)
        autoplayInterval = null
    }
}

const resetAutoplay = () => {
    stopAutoplay()
    startAutoplay()
}

watch(() => props.autoplay, (newVal) => {
    if (newVal) {
        startAutoplay()
    } else {
        stopAutoplay()
    }
})

onMounted(() => {
    startAutoplay()
})

onBeforeUnmount(() => {
    stopAutoplay()
})

</script>

<style scoped>
.slider {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.slider__track {
  display: flex;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slider__slide {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}


.slider__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s;
}

.slider__arrow:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.slider__arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider__arrow--prev {
  left: 40px;
}

.slider__arrow--next {
  right: 40px;
}


.slider__pagination {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.slider__pagination-dot {
  width: 30px;
  height: 7px;
  border-radius: 6px;
  background: var(--grey);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.slider__pagination-dot:hover {
  background: var(--secondary);
}

.slider__pagination-dot--active {
  background: var(--secondary);
}


@media (max-width: 768px) {
  .slider__arrow {
    width: 40px;
    height: 40px;
  }

  .slider__arrow--prev {
    left: 20px;
  }

  .slider__arrow--next {
    right: 20px;
  }

  .slider__pagination {
    bottom: 20px;
  }
}


</style>
