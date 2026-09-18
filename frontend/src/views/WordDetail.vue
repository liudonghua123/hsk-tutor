<template>
  <div class="container-custom py-6">
    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="skeleton h-12 w-3/4"></div>
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="skeleton h-80"></div>
        <div class="skeleton h-80"></div>
        <div class="skeleton h-80"></div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="hanzi" class="space-y-5">
      <!-- Breadcrumb Navigation -->
      <nav class="flex items-center gap-2 text-sm flex-wrap">
        <router-link
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          :to="crumb.path || '#'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
          :class="[
            crumb.path
              ? 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              : 'text-primary-600 font-semibold bg-primary-50 cursor-default',
            index < breadcrumbs.length - 1 ? '' : 'pointer-events-none'
          ]"
        >
          <span>{{ crumb.name }}</span>
          <span v-if="index < breadcrumbs.length - 1" class="text-gray-400">/</span>
        </router-link>
      </nav>

      <!-- Header -->
      <div class="flex items-center justify-between">
        <router-link
          :to="backPath"
          class="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary-50 hover:to-primary-100 border border-gray-200 hover:border-primary-200 rounded-xl text-gray-700 hover:text-primary-700 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <svg class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回 / Back</span>
        </router-link>
        <button
          @click="toggleFavorite"
          class="p-3 rounded-full hover:bg-red-50 transition-colors"
          :class="isFavorited ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'"
        >
          <svg class="w-6 h-6" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <!-- Main Character Display -->
      <div class="grid lg:grid-cols-3 gap-5">
        <!-- Column 1: Character & Writing Practice -->
        <div class="space-y-4">
          <!-- Character Info Card -->
          <div class="card p-6">
            <div class="text-center">
              <span class="text-8xl font-bold text-gray-800">{{ hanzi.word }}</span>
              <div class="mt-3 flex items-center justify-center gap-3">
                <button @click="playAudio" class="flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-full text-primary-700 transition-colors">
                  <svg class="w-5 h-5" :class="{ 'animate-pulse': audioPlaying }" fill="currentColor" viewBox="0 0 24 24">
                    <path v-if="!audioPlaying" d="M8 5v14l11-7z" />
                    <path v-else d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                  <span class="font-medium">{{ hanzi.pinyin }}</span>
                </button>
              </div>
              <div class="mt-3 flex items-center justify-center gap-2 flex-wrap">
                <span v-for="level in hanzi.levels" :key="level" class="badge badge-primary">{{ formatLevel(level) }}</span>
              </div>
            </div>

            <!-- Quick Info -->
            <div class="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary-600">{{ cncharInfo.stroke || hanzi.strokes || '-' }}</div>
                <div class="text-xs text-gray-400">笔画 / Strokes</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ cncharInfo.radical || hanzi.radicals || '-' }}</div>
                <div class="text-xs text-gray-400">部首 / Radical</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ cncharInfo.pinyinLower || '' }}{{ cncharInfo.toneNum || '' }}</div>
                <div class="text-xs text-gray-400">声调 / Tone</div>
              </div>
            </div>
          </div>

          <!-- Writing Practice Area -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
                {{ type === 'write' ? '书写练习 / Writing Practice' : '笔画演示 / Stroke Demo' }}
              </h2>
              <span v-if="type === 'write'" class="text-sm text-gray-500">{{ quizScore }}/{{ quizTotal }}</span>
            </div>
            <div class="flex flex-col items-center">
              <div id="character-canvas" ref="canvasRef" class="w-full max-w-[280px] aspect-square bg-white rounded-2xl shadow-lg border-2 border-gray-100"></div>
              <div class="flex gap-2 mt-4">
                <template v-if="type === 'write'">
                  <button v-if="!quizStarted" @click="startQuiz" class="btn-primary px-5 py-2 text-sm">开始练习</button>
                  <button v-else @click="resetQuiz" class="btn-outline px-5 py-2 text-sm">重置</button>
                </template>
                <template v-else>
                  <button @click="showCharacter" class="btn-outline px-4 py-2 text-sm">显示</button>
                  <button @click="animateCharacter" class="btn-outline px-4 py-2 text-sm">动画</button>
                </template>
              </div>
              <div v-if="quizMessage" class="mt-3 text-center font-medium" :class="quizMessageClass">
                {{ quizMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2: Stroke Detail & Related -->
        <div class="space-y-4">
          <!-- Stroke Detail -->
          <div class="card p-5">
            <h3 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-1 h-5 bg-gradient-to-b from-primary-500 to-blue-500 rounded-full"></span>
              笔画详解 / Stroke Detail
            </h3>
            <div v-if="cncharInfo.strokeDetail && cncharInfo.strokeDetail.length > 0">
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="(stroke, index) in cncharInfo.strokeDetail"
                  :key="index"
                  class="p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  @click="highlightStroke(index)"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-gray-700">{{ stroke.shape }}</span>
                    <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{{ index + 1 }}</span>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{{ stroke.name }}</span>
                    <span class="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{{ stroke.type }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-400">暂无笔画详情</div>
          </div>

          <!-- Related Characters -->
          <div class="card p-5">
            <h3 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-1 h-5 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
              同笔画 / Same Strokes ({{ cncharInfo.sameStrokeChars?.length || 0 }})
            </h3>
            <div v-if="cncharInfo.sameStrokeChars && cncharInfo.sameStrokeChars.length > 0" class="flex flex-wrap gap-2">
              <router-link
                v-for="char in showAllStrokes ? cncharInfo.sameStrokeChars : cncharInfo.sameStrokeChars.slice(0, 20)"
                :key="char"
                :to="`/word/${char}?type=${type}`"
                class="w-10 h-10 bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-lg flex items-center justify-center text-lg font-medium text-pink-700 transition-colors"
              >
                {{ char }}
              </router-link>
              <button
                v-if="cncharInfo.sameStrokeChars.length > 20"
                @click="showAllStrokes = !showAllStrokes"
                class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                {{ showAllStrokes ? '收起' : `+${cncharInfo.sameStrokeChars.length - 20} 更多` }}
              </button>
            </div>
            <div v-else class="text-center py-4 text-gray-400">暂无数据</div>
          </div>

          <!-- Same Pinyin -->
          <div class="card p-5">
            <h3 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-1 h-5 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></span>
              同音字 / Same Pinyin ({{ cncharInfo.samePinyinChars?.length || 0 }})
            </h3>
            <div v-if="cncharInfo.samePinyinChars && cncharInfo.samePinyinChars.length > 0" class="flex flex-wrap gap-2">
              <router-link
                v-for="char in showAllPinyin ? cncharInfo.samePinyinChars : cncharInfo.samePinyinChars.slice(0, 20)"
                :key="char"
                :to="`/word/${char}?type=${type}`"
                class="w-10 h-10 bg-gradient-to-br from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 rounded-lg flex items-center justify-center text-lg font-medium text-green-700 transition-colors"
              >
                {{ char }}
              </router-link>
              <button
                v-if="cncharInfo.samePinyinChars.length > 20"
                @click="showAllPinyin = !showAllPinyin"
                class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                {{ showAllPinyin ? '收起' : `+${cncharInfo.samePinyinChars.length - 20} 更多` }}
              </button>
            </div>
            <div v-else class="text-center py-4 text-gray-400">暂无数据</div>
          </div>
        </div>

        <!-- Column 3: Words, Idioms & More -->
        <div class="space-y-4">
          <!-- Words -->
          <div class="card p-5">
            <h3 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
              词语 / Words ({{ cncharInfo.words?.length || 0 }})
            </h3>
            <div v-if="cncharInfo.words && cncharInfo.words.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="w in showAllWords ? cncharInfo.words : cncharInfo.words.slice(0, 16)"
                :key="w"
                class="word-item px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 text-sm rounded-full cursor-pointer transition-colors"
                @click="showWordPopup(w, $event)"
                @mouseenter="showWordPopup(w, $event)"
              >
                {{ w }}
              </span>
              <button
                v-if="cncharInfo.words.length > 16"
                @click="showAllWords = !showAllWords"
                class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                {{ showAllWords ? '收起' : `+${cncharInfo.words.length - 16} 更多` }}
              </button>
            </div>
            <div v-else class="text-center py-4 text-gray-400">暂无词语</div>
          </div>

          <!-- Idioms -->
          <div class="card p-5">
            <h3 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
              成语 / Idioms ({{ cncharInfo.idiom?.length || 0 }})
            </h3>
            <div v-if="cncharInfo.idiom && cncharInfo.idiom.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="item in showAllIdioms ? cncharInfo.idiom : cncharInfo.idiom.slice(0, 20)"
                :key="item"
                class="idiom-item px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 text-sm rounded-full cursor-pointer transition-colors"
                @click="showIdiomPopup(item, $event)"
                @mouseenter="showIdiomPopup(item, $event)"
              >
                {{ item }}
              </span>
              <button
                v-if="cncharInfo.idiom.length > 20"
                @click="showAllIdioms = !showAllIdioms"
                class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                {{ showAllIdioms ? '收起' : `+${cncharInfo.idiom.length - 20} 更多` }}
              </button>
            </div>
            <div v-else class="text-center py-4 text-gray-400">暂无成语</div>
          </div>

          <!-- Xiehouyu -->
          <div class="card p-5">
            <h3 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
              歇后语 / Folk Sayings ({{ cncharInfo.xhy?.length || 0 }})
            </h3>
            <div v-if="cncharInfo.xhy && cncharInfo.xhy.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="item in cncharInfo.xhy.slice(0, 6)"
                :key="item"
                class="xhy-item p-2.5 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 rounded-lg cursor-pointer transition-colors text-sm"
                @click="showXhyPopup(item, $event)"
                @mouseenter="showXhyPopup(item, $event)"
              >
                <span class="text-gray-700">{{ item.split('-')[0] }}</span>
                <span class="text-gray-400 mx-1">—</span>
                <span class="text-cyan-700">{{ item.split('-')[1] }}</span>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-400">暂无歇后语</div>
          </div>
        </div>
      </div>

      <!-- Explanation Section -->
      <div v-if="hanzi.explanation || hanzi.more" class="card">
        <button @click="explanationExpanded = !explanationExpanded" class="w-full flex items-center justify-between p-5">
          <h3 class="text-base font-bold text-gray-700 flex items-center gap-2">
            <span class="w-1 h-5 bg-gray-400 rounded-full"></span>
            释义 / Explanation
          </h3>
          <svg class="w-5 h-5 text-gray-400 transition-transform" :class="{ 'rotate-180': explanationExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="explanationExpanded" class="px-5 pb-5 space-y-3">
          <p v-if="hanzi.explanation" class="text-gray-600 text-sm leading-relaxed">{{ hanzi.explanation }}</p>
          <p v-if="hanzi.more" class="text-gray-600 text-sm leading-relaxed">{{ hanzi.more }}</p>
        </div>
      </div>

      <!-- Poetry -->
      <PoetryCard />
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">Character not found</p>
      <router-link to="/read" class="btn-primary mt-4 inline-block">Back to Home</router-link>
    </div>

    <!-- Explanation Modal -->
    <Transition name="modal">
      <div v-if="showExplainModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="showExplainModal = false">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">{{ explainTitle }}</h3>
            <button @click="showExplainModal = false" class="p-2 hover:bg-gray-100 rounded-full">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Action buttons -->
          <div class="flex items-center gap-2 mb-4">
            <button @click="playTTS(explainTitle)" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm rounded-full transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span>TTS</span>
            </button>
            <button @click="translateText(explainTitle)" class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm rounded-full transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              <span>翻译</span>
            </button>
          </div>
          <!-- Translation result -->
          <div v-if="modalTranslation" class="mb-3 p-3 bg-purple-50 rounded-xl">
            <p class="text-purple-700 text-sm">{{ modalTranslation }}</p>
          </div>
          <p class="text-gray-600 leading-relaxed">{{ explainContent }}</p>
        </div>
      </div>
    </Transition>

    <!-- Hover/Click Popup for words, idioms, xiehouyu -->
    <Transition name="popup">
      <div
        v-if="showPopup"
        ref="popupRef"
        class="fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 max-w-sm w-[280px]"
        :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
      >
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-base font-bold text-gray-800">{{ popupTitle }}</h4>
          <button @click="showPopup = false" class="p-1 hover:bg-gray-100 rounded-full">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- Action buttons -->
        <div class="flex items-center gap-2 mb-3">
          <button @click="playTTS(popupTitle)" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm rounded-full transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            <span>TTS</span>
          </button>
          <button @click="translateTextInPopup" class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm rounded-full transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            <span>翻译</span>
          </button>
        </div>
        <!-- Translation result -->
        <div v-if="popupTranslation" class="mb-3 p-3 bg-purple-50 rounded-xl">
          <p class="text-purple-700 text-sm">{{ popupTranslation }}</p>
        </div>
        <!-- Explanation content -->
        <div v-if="popupContent" class="text-gray-600 text-sm leading-relaxed">
          <p>{{ popupContent }}</p>
        </div>
        <div v-else class="text-gray-400 text-sm">加载中...</div>
      </div>
    </Transition>

    <!-- Confetti Container -->
    <div ref="confettiRef" class="fixed inset-0 pointer-events-none z-50"></div>

    <!-- Selection Popup -->
    <div
      v-if="showSelectionPopup"
      ref="selectionPopupRef"
      class="fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-50 flex items-center gap-2 selection-popup"
      :style="{ left: selectionPosition.x + 'px', top: selectionPosition.y + 'px' }"
    >
      <button @click="playTTS(selectedText)" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm rounded-full transition-colors">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        <span>TTS</span>
      </button>
      <button @click="translateSelectedText" class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm rounded-full transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
        <span>翻译</span>
      </button>
    </div>

    <!-- Selection Translation Popup -->
    <div
      v-if="showSelectionTranslation"
      class="fixed bg-purple-50 rounded-xl border border-purple-200 p-3 z-50 max-w-sm"
      :style="{ left: selectionPosition.x + 'px', top: (selectionPosition.y + 40) + 'px' }"
    >
      <p class="text-purple-700 text-sm">{{ selectionTranslation }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useApiStore } from '../stores/api'
import { useUserStore } from '../stores/user'
import { useHead } from '@vueuse/head'
import HanziWriter from 'hanzi-writer'
import cnchar from 'cnchar-all'
import PoetryCard from '../components/PoetryCard.vue'

const route = useRoute()
const apiStore = useApiStore()
const userStore = useUserStore()

const hanzi = ref(null)
const loading = ref(true)
const canvasRef = ref(null)
const confettiRef = ref(null)
const writer = ref(null)
const audio = ref(null)
const audioPlaying = ref(false)

// Cnchar info cache
const cncharInfoCache = ref({})

// Quiz state
const quizStarted = ref(false)
const quizScore = ref(0)
const quizTotal = ref(0)
const quizMessage = ref('')
const quizMessageClass = ref('')

// Modal state
const showExplainModal = ref(false)
const explainTitle = ref('')
const explainContent = ref('')
const modalTranslation = ref('')

// Popup state
const showPopup = ref(false)
const popupTitle = ref('')
const popupContent = ref('')
const popupTranslation = ref('')
const popupPosition = ref({ x: 0, y: 0 })
const popupRef = ref(null)
const popupTimeout = ref(null)

// Selection popup state
const showSelectionPopup = ref(false)
const showSelectionTranslation = ref(false)
const selectedText = ref('')
const selectionTranslation = ref('')
const selectionPosition = ref({ x: 0, y: 0 })
const selectionPopupRef = ref(null)

// Collapsed by default
const explanationExpanded = ref(false)

// Show all toggles
const showAllWords = ref(false)
const showAllStrokes = ref(false)
const showAllPinyin = ref(false)
const showAllIdioms = ref(false)

const word = computed(() => route.params.word)
const type = computed(() => route.query.type || 'read')
const level = computed(() => route.query.level)
const itemType = computed(() => type.value === 'write' ? 'handwritten' : 'hanzi')
const isFavorited = computed(() => userStore.isFavorited(itemType.value, word.value))

// Back path based on type and level
const backPath = computed(() => {
  const basePath = type.value === 'write' ? '/write' : type.value === 'grammar' ? '/grammar' : '/read'
  return level.value ? `${basePath}/${level.value}` : basePath
})

// Breadcrumb items
const breadcrumbs = computed(() => {
  const items = [
    { name: 'Home', path: '/' },
    {
      name: type.value === 'write' ? '书写 / Write' : type.value === 'grammar' ? '语法 / Grammar' : '认读 / Read',
      path: type.value === 'write' ? '/write' : type.value === 'grammar' ? '/grammar' : '/read'
    }
  ]
  if (level.value) {
    items.push({
      name: formatLevel(level.value),
      path: `${items[1].path}/${level.value}`
    })
  }
  items.push({ name: word.value, path: null })
  return items
})

// Get cnchar info for character
const cncharInfo = computed(() => {
  if (!word.value || cncharInfoCache.value[word.value]) {
    return cncharInfoCache.value[word.value] || {}
  }
  return {}
})

useHead({
  title: computed(() => hanzi.value ? `${hanzi.value.word} - HSK Tutor` : 'HSK Tutor')
})

function formatLevel(level) {
  return level.replace('hsk', 'HSK ').replace('-', ' ')
}

// TTS function
function playTTS(text) {
  if (!text) return
  const url = `https://omni-gen.app.ynu.edu.cn/tts/${encodeURIComponent(text)}.mp3`
  const audio = new Audio(url)
  audio.play().catch(e => console.error('TTS error:', e))
}

// Translate function
async function translateText(text) {
  if (!text) return
  modalTranslation.value = '翻译中...'
  try {
    const response = await fetch(`https://omni-gen.app.ynu.edu.cn/translate/${encodeURIComponent(text)}`)
    const result = await response.text()
    modalTranslation.value = result || '暂无翻译'
  } catch (e) {
    modalTranslation.value = '翻译失败'
    console.error('Translate error:', e)
  }
}

// Translate text in popup
async function translateTextInPopup() {
  if (!popupTitle.value) return
  popupTranslation.value = '翻译中...'
  try {
    const response = await fetch(`https://omni-gen.app.ynu.edu.cn/translate/${encodeURIComponent(popupTitle.value)}`)
    const result = await response.text()
    popupTranslation.value = result || '暂无翻译'
  } catch (e) {
    popupTranslation.value = '翻译失败'
    console.error('Translate error:', e)
  }
}

// Translate selected text
async function translateSelectedText() {
  if (!selectedText.value) return
  selectionTranslation.value = '翻译中...'
  showSelectionTranslation.value = true
  try {
    const response = await fetch(`https://omni-gen.app.ynu.edu.cn/translate/${encodeURIComponent(selectedText.value)}`)
    const result = await response.text()
    selectionTranslation.value = result || '暂无翻译'
  } catch (e) {
    selectionTranslation.value = '翻译失败'
    console.error('Translate error:', e)
  }
}

// Handle text selection in explanation area
function handleTextSelection() {
  const selection = window.getSelection()
  const text = selection.toString().trim()

  if (text && text.length > 0) {
    selectedText.value = text
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    selectionPosition.value = {
      x: rect.left,
      y: rect.top - 45
    }
    showSelectionPopup.value = true
    showSelectionTranslation.value = false
  } else {
    showSelectionPopup.value = false
    showSelectionTranslation.value = false
  }
}

// Close selection popup when clicking outside
function handleSelectionClickOutside(event) {
  if (selectionPopupRef.value && !selectionPopupRef.value.contains(event.target)) {
    // Check if click was on the translation popup
    const translationPopup = document.querySelector('.selection-translation-popup')
    if (translationPopup && translationPopup.contains(event.target)) return

    showSelectionPopup.value = false
    showSelectionTranslation.value = false
  }
}

// Close popup when clicking outside
function handleClickOutside(event) {
  if (popupRef.value && !popupRef.value.contains(event.target)) {
    // Check if click was on a word/idiom/xhy element
    const target = event.target
    if (!target.closest('.word-item') && !target.closest('.idiom-item') && !target.closest('.xhy-item')) {
      showPopup.value = false
    }
  }
}

// Close popup on escape key
function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    showPopup.value = false
  }
}

// Fetch explanation from API
async function fetchExplain(text) {
  if (!text) return ''
  try {
    const response = await fetch(`https://omni-gen.app.ynu.edu.cn/explain/${encodeURIComponent(text)}`)
    const result = await response.text()
    return result || '暂无释义'
  } catch (e) {
    console.error('Explain error:', e)
    return '暂无释义'
  }
}

// Show popup near click position
function showWordPopup(word, event) {
  popupTitle.value = word
  popupContent.value = ''
  popupTranslation.value = ''
  showPopupNear(event)

  // Load explanation from API
  fetchExplain(word).then(result => {
    popupContent.value = result
  })
}

function showIdiomPopup(idiom, event) {
  popupTitle.value = idiom
  popupContent.value = ''
  popupTranslation.value = ''
  showPopupNear(event)

  // Load explanation from API
  fetchExplain(idiom).then(result => {
    popupContent.value = result
  })
}

function showXhyPopup(xhy, event) {
  const [question, answer] = xhy.split('-')
  popupTitle.value = question
  popupContent.value = answer ? `答案: ${answer}` : xhy
  popupTranslation.value = ''
  showPopupNear(event)
}

function showPopupNear(event) {
  const x = event.clientX + 15
  const y = event.clientY + 15

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 320)
  const adjustedY = Math.min(y, window.innerHeight - 200)

  popupPosition.value = { x: adjustedX, y: adjustedY }
  showPopup.value = true
}

// Show word/idiom explanation (modal version)
function showWordExplain(word) {
  explainTitle.value = word
  explainContent.value = '加载中...'
  showExplainModal.value = true

  fetchExplain(word).then(result => {
    explainContent.value = result
  })
}

function showIdiomExplain(idiom) {
  explainTitle.value = idiom
  explainContent.value = '加载中...'
  showExplainModal.value = true

  fetchExplain(idiom).then(result => {
    explainContent.value = result
  })
}

function showXhyExplain(xhy) {
  const [question, answer] = xhy.split('-')
  explainTitle.value = question
  explainContent.value = answer || xhy
  showExplainModal.value = true
}

// Load cnchar info for a character
function loadCncharInfo(char) {
  if (!char || cncharInfoCache.value[char]) return

  try {
    // Get stroke count
    const strokeCount = cnchar.stroke(char)

    // Get radical info (returns array)
    const radicalInfo = cnchar.radical(char)
    const radicalData = radicalInfo && radicalInfo.length > 0 ? radicalInfo[0] : null
    const radicalChar = radicalData?.radical || ''

    // Get spell/pinyin
    const spell = cnchar.spell(char)
    const toneInfo = cnchar.transformTone(spell)
    const pinyinWithTone = toneInfo?.tone ? `${spell.toLowerCase()}${toneInfo.tone}` : spell.toLowerCase()

    // Get stroke detail
    const strokeDetail = cnchar.stroke(char, 'order', 'detail')
    const flatStrokes = strokeDetail && strokeDetail[0] ? strokeDetail[0] : []

    // Get words, idioms, xiehouyu
    const words = cnchar.words(char) || []
    const idioms = cnchar.idiom(char) || []
    const xiehouyu = cnchar.xhy(char, 'fuzzy') || []

    // Get same stroke / same pinyin characters
    const sameStrokeStr = cnchar.strokeToWord(strokeCount) || ''
    const samePinyinStr = cnchar.spellToWord(spell, 'alltone') || ''

    const info = {
      stroke: strokeCount,
      radical: radicalChar,
      radicalInfo: radicalData,
      pinyin: spell,
      pinyinLower: spell.toLowerCase(),
      tonal: pinyinWithTone,
      toneNum: toneInfo?.tone || 0,
      strokeDetail: flatStrokes,
      words: words,
      idiom: idioms,
      xhy: xiehouyu,
      sameStrokeChars: sameStrokeStr.split('').filter(c => c !== char),
      samePinyinChars: samePinyinStr.split('').filter(c => c !== char),
    }
    cncharInfoCache.value[char] = info
  } catch (e) {
    console.error('cnchar error:', e)
    cncharInfoCache.value[char] = {}
  }
}

async function toggleFavorite() {
  const wasFavorited = isFavorited.value

  // Update local first
  userStore.toggleFavorite(itemType.value, word.value)

  // Sync to cloud if cloud user
  if (!userStore.isLocal) {
    try {
      if (wasFavorited) { // was already favorited, now removed
        await apiStore.removeFavorite(userStore.userId, itemType.value, word.value)
      } else { // was not favorited, now added
        await apiStore.addFavorite(userStore.userId, itemType.value, word.value)
      }
    } catch (error) {
      console.error('Failed to sync favorite to cloud:', error)
      // Revert local change if cloud sync failed
      userStore.toggleFavorite(itemType.value, word.value)
    }
  }
}

function playAudio() {
  if (!hanzi.value?.pinyin) return

  const pinyin = hanzi.value.pinyin.toLowerCase()
  const url = `https://zidian.gushici.net/d/mp3/${encodeURIComponent(pinyin)}.mp3`

  if (audio.value) {
    audio.value.pause()
  }

  audio.value = new Audio(url)
  audioPlaying.value = true

  audio.value.onended = () => { audioPlaying.value = false }
  audio.value.onerror = () => { audioPlaying.value = false }
  audio.value.play()
}

function initWriter() {
  if (!canvasRef.value || !hanzi.value) return

  if (writer.value) {
    writer.value = null
  }

  if (type.value === 'write') {
    writer.value = HanziWriter.create(canvasRef.value, hanzi.value.word, {
      width: 280,
      height: 280,
      padding: 15,
      strokeColor: '#0ea5e9',
      showOutline: true,
      showCharacter: false,
      drawingColor: '#0ea5e9',
      drawingWidth: 20,
      outlineColor: '#e2e8f0',
    })
  } else {
    writer.value = HanziWriter.create(canvasRef.value, hanzi.value.word, {
      width: 280,
      height: 280,
      padding: 15,
      strokeColor: '#0ea5e9',
      showOutline: true,
      showCharacter: false,
    })
  }
}

function showCharacter() {
  if (writer.value && type.value !== 'write') {
    writer.value.showCharacter()
  }
}

function animateCharacter() {
  if (writer.value && type.value !== 'write') {
    writer.value.hideCharacter()
    writer.value.animateCharacter()
  }
}

function highlightStroke(index) {
  if (writer.value) {
    writer.value.animateStroke(index)
  }
}

function startQuiz() {
  if (!writer.value) return

  quizStarted.value = true
  quizScore.value = 0
  quizTotal.value = 0
  quizMessage.value = ''
  quizMessageClass.value = ''

  writer.value.quiz({
    onComplete: (summaryData) => {
      quizTotal.value = summaryData.totalStrokes
      quizScore.value = summaryData.correctStrokes
      quizMessageClass.value = 'text-green-600 font-bold'

      if (summaryData.correctStrokes === summaryData.totalStrokes) {
        quizMessage.value = '完美! Perfect!'
        showConfetti()
      } else if (summaryData.correctStrokes >= summaryData.totalStrokes * 0.8) {
        quizMessage.value = '不错! Great!'
        showConfetti()
      } else {
        quizMessage.value = `继续加油! ${summaryData.correctStrokes}/${summaryData.totalStrokes}`
      }
    }
  })
}

function resetQuiz() {
  quizStarted.value = false
  quizScore.value = 0
  quizTotal.value = 0
  quizMessage.value = ''
  quizMessageClass.value = ''
  nextTick(() => {
    if (canvasRef.value) {
      canvasRef.value.innerHTML = ''
      initWriter()
    }
  })
}

function showConfetti() {
  if (!confettiRef.value) return

  const colors = ['#0ea5e9', '#a855f7', '#fbbf24', '#22c55e', '#ef4444', '#f97316']
  const confettiCount = 80

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div')
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 9999;
    `
    confettiRef.value.appendChild(confetti)

    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
      duration: 2000 + Math.random() * 2000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    })

    animation.onfinish = () => confetti.remove()
  }
}

async function fetchData() {
  loading.value = true
  try {
    if (type.value === 'write') {
      hanzi.value = await apiStore.fetchHandwrittenDetail(word.value, userStore.userId)
    } else {
      hanzi.value = await apiStore.fetchHanziDetail(word.value, userStore.userId)
    }

    // Mark as visited
    userStore.markVisited(itemType.value, word.value)

    // Load cnchar info
    if (hanzi.value?.word) {
      loadCncharInfo(hanzi.value.word)
    }

    setTimeout(initWriter, 100)
  } catch (error) {
    console.error('Failed to fetch hanzi:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('mouseup', handleTextSelection)
  document.addEventListener('click', handleSelectionClickOutside)
})

watch(word, () => {
  // Reset show-all toggles when word changes
  showAllWords.value = false
  showAllStrokes.value = false
  showAllPinyin.value = false
  showAllIdioms.value = false
  fetchData()
})
watch(type, () => {
  nextTick(() => {
    resetQuiz()
  })
})

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause()
  }
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('mouseup', handleTextSelection)
  document.removeEventListener('click', handleSelectionClickOutside)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}

/* Popup animation */
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Explanation text selection popup */
.selection-popup {
  position: fixed;
  z-index: 1000;
  pointer-events: auto;
}
</style>