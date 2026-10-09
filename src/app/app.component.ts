import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { AudioService } from './services/audio.service';
import { StoryService, Milestone, LoveReason } from './services/story.service';
import { TrackerService, TrackerEntry } from './services/tracker.service';

interface TimeCounter {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export interface LoveChapterPage {
  id: 'home' | 'memories' | 'reasons' | 'letters' | 'shayari' | 'coupons' | 'games' | 'proposal';
  chapterLabel: string;
  title: string;
  navTitle: string;
  icon: string;
  description: string;
  badge?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('proposalSection') proposalSectionRef?: ElementRef;

  public title = 'Love Story';

  // State
  public timeTogether: TimeCounter = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private timeInterval: any;

  // Floating background hearts
  public backgroundHearts: { left: string; size: string; duration: string; delay: string; opacity: number }[] = [];

  // Sparkles trail
  public sparkles: SparkleParticle[] = [];
  private sparkleCounter = 0;

  // Interactive sections
  public isLetterOpen = false;
  public selectedLetterId: string = 'feb-24-meeting';
  public selectedMilestone: Milestone | null = null;
  public activeReasonId: number | null = null;
  public selectedLetterCategory: 'all' | 'distance' | 'vows' | 'open-when' | 'moments' | 'favorites' = 'all';

  // Favorites / Bookmarks State
  public favoriteLetterIds: string[] = ['feb-24-meeting', 'distance-love'];
  public favoriteShayariIds: number[] = [1, 11, 24];

  public get currentLetter(): any {
    return this.story.loveLetters.find(l => l.id === this.selectedLetterId) || this.story.loveLetters[0];
  }

  public get filteredLetters(): any[] {
    if (this.selectedLetterCategory === 'favorites') {
      return this.story.loveLetters.filter(l => this.favoriteLetterIds.includes(l.id));
    }
    if (this.selectedLetterCategory === 'distance') {
      return this.story.loveLetters.filter(l => ['feb-24-meeting', 'distance-love', 'next-reunion', 'miss-you', 'midnight-call', 'sleepy-video-calls'].includes(l.id));
    }
    if (this.selectedLetterCategory === 'vows') {
      return this.story.loveLetters.filter(l => ['proposal', 'promises', 'letter-80', 'future', 'first-anniversary', 'our-little-home', 'our-future-kitchen'].includes(l.id));
    }
    if (this.selectedLetterCategory === 'open-when') {
      return this.story.loveLetters.filter(l => ['miss-you', 'tough-days', 'rainy-day', 'you-are-enough', 'when-you-are-mad', 'safe-with-me', 'when-you-doubt-yourself'].includes(l.id));
    }
    if (this.selectedLetterCategory === 'moments') {
      return this.story.loveLetters.filter(l => ['morning-letter', 'first-touch', 'best-friend', 'little-things', 'celebrate-you', 'multiverse', 'growing-together', 'soul-connection', 'your-hands-in-mine', 'the-quiet-moments'].includes(l.id));
    }
    return this.story.loveLetters;
  }

  public setLetterCategory(cat: 'all' | 'distance' | 'vows' | 'open-when' | 'moments' | 'favorites'): void {
    this.selectedLetterCategory = cat;
    this.audio.playTone(600, 0.15, 'sine', 0.08);
    const list = this.filteredLetters;
    if (list.length > 0 && !list.some(l => l.id === this.selectedLetterId)) {
      this.selectedLetterId = list[0].id;
    }
  }

  public toggleFavoriteLetter(id: string): void {
    const idx = this.favoriteLetterIds.indexOf(id);
    if (idx >= 0) {
      this.favoriteLetterIds.splice(idx, 1);
      this.showToast('Removed letter from Favorites 🤍');
    } else {
      this.favoriteLetterIds.push(id);
      this.audio.playMagicSparkle();
      this.launchHeartBurst();
      this.showToast('Added letter to Favorites! ⭐💖');
    }
    try {
      localStorage.setItem('love_fav_letters', JSON.stringify(this.favoriteLetterIds));
    } catch (e) {}
  }

  public isLetterFavorited(id: string): boolean {
    return this.favoriteLetterIds.includes(id);
  }

  public selectLetter(id: string, autoScroll = false): void {
    this.selectedLetterId = id;
    this.isLetterOpen = true;
    this.audio.playHarpChime();
    this.launchHeartBurst();

    const letter = this.story.loveLetters.find(l => l.id === id);
    this.tracker.logAction('letter', `Opened Love Letter: "${letter?.title || id}" 💌`, {
      letterId: id,
      title: letter?.title,
      badge: letter?.badge,
      tag: letter?.tag
    });

    if (autoScroll) {
      setTimeout(() => {
        const el = document.getElementById('letterParchment') || document.getElementById('letter');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }
  }

  public openNextLetter(): void {
    const list = this.filteredLetters.length > 0 ? this.filteredLetters : this.story.loveLetters;
    const currentIndex = list.findIndex(l => l.id === this.selectedLetterId);
    const nextIndex = (currentIndex + 1) % list.length;
    this.selectLetter(list[nextIndex].id, true);
  }

  public openPrevLetter(): void {
    const list = this.filteredLetters.length > 0 ? this.filteredLetters : this.story.loveLetters;
    const currentIndex = list.findIndex(l => l.id === this.selectedLetterId);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    this.selectLetter(list[prevIndex].id, true);
  }

  // --- Touch Swipe Navigation for Love Letters ---
  private touchStartX = 0;
  private touchStartY = 0;

  public onLetterTouchStart(e: TouchEvent): void {
    if (e.touches && e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  public onLetterTouchEnd(e: TouchEvent): void {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;
      // Only trigger horizontal swipe if deltaX is dominant
      if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        if (deltaX < 0) {
          // Swiped left -> Next Letter
          this.openNextLetter();
        } else {
          // Swiped right -> Previous Letter
          this.openPrevLetter();
        }
      }
    }
  }

  // Sweet Notes Jar
  public currentSweetNote: string = '';
  public isDrawingNote = false;

  // Shayari & Poetry State
  public selectedShayariCategory: 'all' | 'distance' | 'romantic' | 'soulful' | 'promise' | 'sweet' | 'favorites' = 'all';

  public get filteredShayaris(): any[] {
    if (this.selectedShayariCategory === 'favorites') {
      return this.story.shayaris.filter(s => this.favoriteShayariIds.includes(s.id));
    }
    if (this.selectedShayariCategory === 'all') {
      return this.story.shayaris;
    }
    return this.story.shayaris.filter(s => s.category === this.selectedShayariCategory);
  }

  public setShayariCategory(cat: 'all' | 'distance' | 'romantic' | 'soulful' | 'promise' | 'sweet' | 'favorites'): void {
    this.selectedShayariCategory = cat;
    this.audio.playTone(520, 0.15, 'sine', 0.08);
  }

  public toggleFavoriteShayari(id: number): void {
    const idx = this.favoriteShayariIds.indexOf(id);
    if (idx >= 0) {
      this.favoriteShayariIds.splice(idx, 1);
      this.showToast('Removed poetry from Favorites 🤍');
    } else {
      this.favoriteShayariIds.push(id);
      this.audio.playMagicSparkle();
      this.launchHeartBurst();
      this.showToast('Saved poetry to Favorites! ⭐📜');
    }
    try {
      localStorage.setItem('love_fav_shayaris', JSON.stringify(this.favoriteShayariIds));
    } catch (e) {}
  }

  public isShayariFavorited(id: number): boolean {
    return this.favoriteShayariIds.includes(id);
  }

  public copyShayari(shayari: any): void {
    const text = shayari.lines.join('\n') + '\n\n"' + shayari.translation + '"';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Shayari copied to clipboard! 📜❤️');
        this.launchHeartBurst();
        this.tracker.logAction('letter', `Copied Shayari: "${shayari.lines[0]?.slice(0, 45)}..." 📜`, {
          title: shayari.title,
          category: shayari.category,
          firstLine: shayari.lines[0]
        });
      }).catch(() => {
        this.showToast('Poetry for you! 💖');
      });
    } else {
      this.showToast('Poetry for you! 💖');
    }
  }

  // Love Coupons Redemption
  public redeemCoupon(coupon: any): void {
    if (coupon.isRedeemed) {
      this.showToast('Already redeemed! But you can use it again anytime! 😉');
      return;
    }
    coupon.isRedeemed = true;
    this.audio.playCelebrationFanfare();
    this.launchHeartBurst();
    this.showToast(`Redeemed: ${coupon.title}! 🎟️❤️`);
    this.tracker.logAction('coupon', `Redeemed Coupon: "${coupon.title}" 🎟️`, {
      couponId: coupon.id,
      description: coupon.description,
      tag: coupon.tag
    });
  }

  // Proposal State
  public proposalAnswered = false;
  public acceptedDate: Date | null = null;
  public yesScale = 1.0;
  public noEscapeCount = 0;
  public currentNoText = 'No';
  public noBtnStyle: { [key: string]: string } = {};

  public readonly runawayResponses = [
    'No',
    'Are you sure? 🥺',
    'Think again! 💕',
    'Did your finger slip? 😉',
    'Look how shiny the YES button is! ✨',
    'Unlimited hugs included! 🤗',
    'What about forever forehead kisses? 🌹',
    'I promise to love you always! 💍',
    'Error 404: "No" not found! 🙈',
    'Please reconsider, my love! ❤️'
  ];

  // Customizer & Share Modal
  public showCustomizer = false;
  public showShareToast = false;
  public shareToastMsg = '';

  // Mobile App Installation & PWA State
  public deferredInstallPrompt: any = null;
  public isAppInstalled = false;
  public showInstallModal = false;
  public isIosDevice = false;

  // Activity Tracker State
  public showTrackerModal = false;
  public trackerFilter: 'all' | 'proposal' | 'input' | 'game' | 'letter' | 'coupon' = 'all';
  public showWebhookSetup = false;
  public showRawTabularBox = false;
  public webhookInputUrl = '';
  public isSyncingToSheet = false;

  // Multi-Page Navigation State & Chapters Directory
  public readonly pagesList: LoveChapterPage[] = [
    {
      id: 'home',
      chapterLabel: 'Prologue',
      title: 'Our Journey of Love',
      navTitle: 'Home 🏡',
      icon: '❤️',
      description: 'Welcome, Live Love Time Counter & Chapter Directory',
      badge: 'Prologue'
    },
    {
      id: 'memories',
      chapterLabel: 'Chapter 1',
      title: 'Our Memories & Milestones',
      navTitle: 'Memories 🌹',
      icon: '🌹',
      description: 'Relive our sacred meeting on 24 Feb 2026 and precious milestones',
      badge: 'Timeline'
    },
    {
      id: 'reasons',
      chapterLabel: 'Chapter 2',
      title: 'Why I Love You',
      navTitle: 'Why You 💖',
      icon: '💖',
      description: '50 heartfelt reasons, romantic photos & Sweet Notes Jar',
      badge: '50 Reasons'
    },
    {
      id: 'letters',
      chapterLabel: 'Chapter 3',
      title: 'Emotional Love Letters',
      navTitle: 'Letters 💌',
      icon: '💌',
      description: '25 deep love letters, distance vows, midnight calls and open-when notes',
      badge: '25 Letters'
    },
    {
      id: 'shayari',
      chapterLabel: 'Chapter 4',
      title: 'Romantic Shayari & Poetry',
      navTitle: 'Shayari 📜',
      icon: '📜',
      description: '35+ soulful Hindi & Urdu couplets with English translation and favorites',
      badge: '35+ Couplets'
    },
    {
      id: 'coupons',
      chapterLabel: 'Chapter 5',
      title: 'Love Coupons & Vouchers',
      navTitle: 'Coupons 🎟️',
      icon: '🎟️',
      description: '8 sweet romantic vouchers redeemable anytime',
      badge: '8 Coupons'
    },
    {
      id: 'games',
      chapterLabel: 'Chapter 6',
      title: 'Romance Arcade & Playground',
      navTitle: 'Love Fun 🎡💖',
      icon: '🎡',
      description: '18 interactive games: Love Wheel, Memory Match, Apology Generator, Plant Care & more',
      badge: '18 Games'
    },
    {
      id: 'proposal',
      chapterLabel: 'Grand Finale',
      title: 'The Big Question',
      navTitle: 'The Question 💍',
      icon: '💍',
      description: 'Will you be my girlfriend? The moment of forever & Certificate',
      badge: 'Forever'
    }
  ];

  public currentPage: 'home' | 'memories' | 'reasons' | 'letters' | 'shayari' | 'coupons' | 'games' | 'proposal' = 'home';
  private hashListener?: () => void;

  public get currentPageIndex(): number {
    return this.pagesList.findIndex(p => p.id === this.currentPage);
  }

  public get currentPageMeta(): LoveChapterPage {
    return this.pagesList.find(p => p.id === this.currentPage) || this.pagesList[0];
  }

  public get prevPage(): LoveChapterPage | null {
    const idx = this.currentPageIndex;
    if (idx > 0) {
      return this.pagesList[idx - 1];
    }
    return null;
  }

  public get nextPage(): LoveChapterPage | null {
    const idx = this.currentPageIndex;
    if (idx >= 0 && idx < this.pagesList.length - 1) {
      return this.pagesList[idx + 1];
    }
    return null;
  }

  public goToPrevPage(): void {
    if (this.prevPage) {
      this.navigateToPage(this.prevPage.id);
    }
  }

  public goToNextPage(): void {
    if (this.nextPage) {
      this.navigateToPage(this.nextPage.id);
    }
  }

  // Mobile Navigation Drawer State
  public isMobileMenuOpen = false;

  public toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.audio.playCutePop();
  }

  public closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  public navigateToPage(pageId: string, track = true): void {
    const target = this.normalizePageId(pageId);
    this.closeMobileMenu();
    this.audio.playCutePop();

    if (this.currentPage !== target) {
      this.currentPage = target;
      if (track) {
        const meta = this.pagesList.find(p => p.id === target);
        this.tracker.logAction('visit', `Switched Page to: ${meta ? meta.chapterLabel + ' - ' + meta.title : target} 📖`, {
          pageId: target,
          title: meta?.title,
          chapter: meta?.chapterLabel
        });
      }
    }

    try {
      const hashStr = '#' + target;
      if (window.location.hash !== hashStr) {
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', hashStr);
        } else {
          window.location.hash = hashStr;
        }
      }
    } catch (e) {
      // ignore
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  public normalizePageId(id: string): 'home' | 'memories' | 'reasons' | 'letters' | 'shayari' | 'coupons' | 'games' | 'proposal' {
    const clean = (id || '').replace(/^#/, '').toLowerCase().trim();
    if (clean === 'story' || clean === 'memories') return 'memories';
    if (clean === 'reasons') return 'reasons';
    if (clean === 'letter' || clean === 'letters') return 'letters';
    if (clean === 'shayari' || clean === 'poetry') return 'shayari';
    if (clean === 'coupons' || clean === 'coupon') return 'coupons';
    if (clean === 'playground' || clean === 'games' || clean === 'arcade') return 'games';
    if (clean === 'proposal' || clean === 'question') return 'proposal';
    return 'home';
  }

  public syncPageFromUrl(): void {
    try {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const target = this.normalizePageId(hash);
        if (this.currentPage !== target) {
          this.currentPage = target;
          const meta = this.pagesList.find(p => p.id === target);
          this.tracker.logAction('visit', `Direct Link Opened: ${meta?.title || target} 📖`, {
            pageId: target,
            hash
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  public scrollToSection(sectionId: string): void {
    this.navigateToPage(sectionId);
  }

  public get filteredTrackerLogs(): TrackerEntry[] {
    if (this.trackerFilter === 'all') {
      return this.tracker.logs;
    }
    return this.tracker.logs.filter(l => l.category === this.trackerFilter);
  }

  public setTrackerFilter(filter: 'all' | 'proposal' | 'input' | 'game' | 'letter' | 'coupon'): void {
    this.trackerFilter = filter;
    this.audio.playCutePop();
  }

  public openTracker(): void {
    this.showTrackerModal = true;
    this.closeMobileMenu();
    this.webhookInputUrl = this.tracker.webhookUrl;
    this.audio.playCutePop();
  }

  public closeTracker(): void {
    this.showTrackerModal = false;
  }

  // Theme
  public currentTheme: 'dark' | 'light' = 'dark';

  // Floating Heart Emojis Array
  public floatingHeartEmojis: {
    emoji: string;
    left: string;
    size: string;
    duration: string;
    delay: string;
    opacity: number;
  }[] = [];

  // Click-anywhere Heart Burst particles
  public clickHearts: { id: number; x: number; y: number; emoji: string }[] = [];
  private clickHeartCounter = 0;

  // --- ACTIVITY 1: Spin The Love Wheel ---
  public isSpinningWheel = false;
  public wheelRotation = 0;
  public wheelResult: any = null;
  public readonly wheelOptions = [
    { label: '💋 100 Forehead Kisses', desc: 'Guaranteed 100 gentle kisses on forehead, cheeks & nose!', emoji: '💋' },
    { label: '🍕 Midnight Food Delivery', desc: 'Boyfriend orders your favorite pizza, dessert, or sweet cravings!', emoji: '🍕' },
    { label: '👑 Queen For 7 Days', desc: 'Boyfriend bows down and fulfills your wishes with unconditional love!', emoji: '👑' },
    { label: '💃 Bollywood Dance On Call', desc: 'Boyfriend must dance to a funny romantic song on video call!', emoji: '💃' },
    { label: '🤫 Truth Confession Pass', desc: 'Ask boyfriend any 1 question and he must answer 100% truthfully!', emoji: '🤫' },
    { label: '☕ Breakfast in Bed Pass', desc: 'Pancakes & warm coffee served in bed on our next meetup!', emoji: '☕' },
    { label: '🥺 Win Any Argument Card', desc: 'Girlfriend is 100% right! Boyfriend admits defeat with a tight hug!', emoji: '🥺' },
    { label: '✈️ 10-Minute Reunion Hug', desc: 'Non-stop tight embrace at arrivals the second we meet again!', emoji: '✈️' }
  ];

  // --- ACTIVITY 2: Long-Distance Virtual Hug Charger ---
  public hugProgress = 0;
  public isChargingHug = false;
  public hugSent = false;
  private hugInterval: any = null;

  // --- ACTIVITY 3: Emergency Girlfriend Drama & Mood Fixer ---
  public activeDramaTab: 'hangry' | 'late_reply' | 'attention' | 'love_me' = 'hangry';
  public readonly dramaSolutions: { [key: string]: { title: string; quote: string; message: string; emoji: string; badge: string } } = {
    hangry: {
      badge: '🍟 Code: Hangry Alert',
      title: 'Emergency Food & Snack Protocol',
      quote: '"A hungry girl is a dangerous girl. Instant snacks dispatched!"',
      message: 'Boyfriend officially authorizes immediate snacking! Chocolate, pizza, ice cream, and loaded fries are on their way. Please do not bite the boyfriend, he loves you! 🥺❤️',
      emoji: '🍟'
    },
    late_reply: {
      badge: '⚖️ Court Verdict: Guilty!',
      title: 'Guilty of Slow Typing & Daydreaming',
      quote: '"The boyfriend was probably staring at your picture or typing with one thumb!"',
      message: 'Verdict: Boyfriend is 100% guilty of making his favorite girl wait. His penalty is: 100 voice notes saying "I love you" and singing your favorite song terribly on call! 🙈',
      emoji: '📱'
    },
    attention: {
      badge: '📡 Radar Locked',
      title: '100% Undivided Attention Beam Activated',
      quote: '"All frequencies locked exclusively onto you."',
      message: 'Boyfriend has dropped all games, phone notifications, and chores. You have his undivided, 1000% uninterrupted attention right now. Tell him anything and everything! 🥰',
      emoji: '👀'
    },
    love_me: {
      badge: '🌹 Eternal Truth',
      title: 'Do I Still Love You? A Million Times Yes!',
      quote: '"More than yesterday, less than tomorrow, but infinitely right now."',
      message: 'From the day we met on 24 February 2026 until the end of time, there is nobody else for me. Even across the miles, you are my favorite thought, my heartbeat, and my home! 💕',
      emoji: '💖'
    }
  };

  // --- ACTIVITY 4: Romantic & Funny Couple Quiz ---
  public quizQuestions = [
    {
      q: 'Who fell in love first? 💘',
      options: [
        { text: 'Him! (He was completely spellbound on 24 Feb!)', feedback: '100% Fact! He couldn’t stop smiling for weeks!' },
        { text: 'She did! (She secretly fell first but played it cool 😉)', feedback: 'Aww, she couldn’t resist his charm either!' },
        { text: 'Mutual lightning strike at the exact same second! ✨', feedback: 'Destiny wrote this in the stars on 24 Feb 2026!' }
      ],
      answered: false,
      selectedFeedback: ''
    },
    {
      q: 'Who takes longer to get ready for video calls? 💄',
      options: [
        { text: 'Her! (Needs to look 10/10 angelic for her man)', feedback: 'And she looks breathtaking every single time!' },
        { text: 'Him! (Checking hair and camera angles 50 times 😆)', feedback: 'Guilty! He gets nervous before seeing his dream girl!' },
        { text: 'Both, but she always looks 1000x better!', feedback: 'Absolute truth, boyfriend happily agrees!' }
      ],
      answered: false,
      selectedFeedback: ''
    },
    {
      q: 'What does "I am fine" actually mean when she says it? 🚨',
      options: [
        { text: 'Code Red! Prepare chocolate, apologies & hugs immediately!', feedback: 'Pro boyfriend tip: Never say "Okay" to "I am fine"!' },
        { text: 'She needs a long warm hug and reassurance', feedback: 'Distance can’t stop him from sending infinite love!' },
        { text: 'Listen patiently and pamper her with sweet words', feedback: 'Emotional intelligence level 1000!' }
      ],
      answered: false,
      selectedFeedback: ''
    },
    {
      q: 'Who is the real boss in this relationship? 👑',
      options: [
        { text: 'Obviously Her! (Boyfriend happily surrenders)', feedback: 'Happy girlfriend = Happy life! Certified fact!' },
        { text: 'Boyfriend thinks he is, but she runs the show 😆', feedback: 'He just likes to feel in charge for 5 minutes!' },
        { text: 'Equal partners in love, mischief, and life! 🤝❤️', feedback: 'Unbreakable soulmate duo!' }
      ],
      answered: false,
      selectedFeedback: ''
    }
  ];

  constructor(
    public audio: AudioService,
    public story: StoryService,
    public tracker: TrackerService
  ) {}

  ngOnInit(): void {
    // Restore saved favorites
    try {
      const favLetters = localStorage.getItem('love_fav_letters');
      if (favLetters) this.favoriteLetterIds = JSON.parse(favLetters);
      const favShayaris = localStorage.getItem('love_fav_shayaris');
      if (favShayaris) this.favoriteShayariIds = JSON.parse(favShayaris);
      const savedTheme = localStorage.getItem('love_ambient_theme') as any;
      if (savedTheme) this.ambientTheme = savedTheme;
    } catch (e) {}

    this.generateBackgroundHearts();
    this.updateTimeTogether();
    this.timeInterval = setInterval(() => this.updateTimeTogether(), 1000);

    // Initial sweet note
    this.currentSweetNote = this.story.sweetNotesJar[0];

    // Multi-page navigation sync from URL hash
    this.syncPageFromUrl();
    this.hashListener = () => this.syncPageFromUrl();
    window.addEventListener('hashchange', this.hashListener);
    window.addEventListener('popstate', this.hashListener);

    // Initialize Memory Match game
    this.initMemoryGame();

    // Check if ?tracker or ?admin is in query params to open tracker modal immediately
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('tracker') || params.has('admin') || params.has('logs')) {
        this.showTrackerModal = true;
      }
    } catch (e) {
      // ignore
    }

    // PWA & Mobile App detection
    try {
      this.isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      this.isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredInstallPrompt = e;
      });

      window.addEventListener('appinstalled', () => {
        this.isAppInstalled = true;
        this.deferredInstallPrompt = null;
        this.showToast('🎉 Love Story App successfully installed on your phone! ❤️');
        this.tracker.logAction('visit', 'Installed App on Mobile Device 📲');
      });
    } catch (e) {
      // ignore
    }
  }

  public promptInstallApp(): void {
    this.closeMobileMenu();
    this.audio.playCutePop();
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          this.showToast('Installing app to home screen... 📲❤️');
          this.tracker.logAction('visit', 'User Accepted App Installation 📲');
        }
        this.deferredInstallPrompt = null;
      });
    } else {
      this.showInstallModal = true;
      this.tracker.logAction('visit', 'Opened Install App Guide Modal 📲');
    }
  }

  public closeInstallModal(): void {
    this.showInstallModal = false;
  }

  ngOnDestroy(): void {
    if (this.hashListener) {
      window.removeEventListener('hashchange', this.hashListener);
      window.removeEventListener('popstate', this.hashListener);
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.hugInterval) {
      clearInterval(this.hugInterval);
    }
    if (this.fingerprintInterval) {
      clearInterval(this.fingerprintInterval);
    }
    if (this.kissGameTimer) {
      clearInterval(this.kissGameTimer);
    }
    if (this.kissSpawnInterval) {
      clearInterval(this.kissSpawnInterval);
    }
  }

  // --- Theme Toggle ---
  public toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme === 'light' ? 'light-romance' : 'dark');
  }

  // --- Ambient Atmosphere Particle Theme Switcher ---
  public ambientTheme: 'hearts' | 'petals' | 'stars' = 'hearts';

  public setAmbientTheme(theme: 'hearts' | 'petals' | 'stars'): void {
    this.ambientTheme = theme;
    try {
      localStorage.setItem('love_ambient_theme', theme);
    } catch (e) {}
    this.generateBackgroundHearts();
    this.audio.playCutePop();
    const label = theme === 'hearts' ? 'Floating Hearts 💖' : theme === 'petals' ? 'Rose Petals 🌹' : 'Cosmic Stars ✨';
    this.showToast(`Atmosphere set to: ${label}!`);
    this.tracker.logAction('input', `Switched Ambient Atmosphere to ${label}`);
  }

  // --- Background Hearts Generation ---
  private generateBackgroundHearts(): void {
    let emojis = ['💖', '❤️', '💕', '💗', '💓', '💞', '💘', '✨', '🌹', '🥰', '💌', '🌸'];
    if (this.ambientTheme === 'petals') {
      emojis = ['🌹', '🌸', '🌺', '🌷', '💐', '🥀', '🍃', '✨', '💖'];
    } else if (this.ambientTheme === 'stars') {
      emojis = ['✨', '🌟', '💫', '⭐', '🌙', '🌌', '🪐', '🔮', '💎'];
    }

    const list = [];
    for (let i = 0; i < 30; i++) {
      list.push({
        emoji: emojis[i % emojis.length],
        left: `${Math.random() * 95}%`,
        size: `${Math.floor(Math.random() * 22 + 16)}px`,
        duration: `${Math.floor(Math.random() * 10 + 8)}s`,
        delay: `${(Math.random() * 8).toFixed(1)}s`,
        opacity: Math.random() * 0.45 + 0.2
      });
    }
    this.floatingHeartEmojis = list;

    // SVG background hearts for depth
    const svgList = [];
    for (let i = 0; i < 15; i++) {
      svgList.push({
        left: `${Math.random() * 96}%`,
        size: `${Math.floor(Math.random() * 26 + 14)}px`,
        duration: `${Math.floor(Math.random() * 12 + 10)}s`,
        delay: `${(Math.random() * 10).toFixed(1)}s`,
        opacity: Math.random() * 0.4 + 0.1
      });
    }
    this.backgroundHearts = svgList;
  }

  // --- First Gesture Audio Unlock & Touch/Click Particles ---
  private hasUnlockedAudio = false;

  private unlockAudioOnFirstGesture(): void {
    if (!this.hasUnlockedAudio) {
      this.hasUnlockedAudio = true;
      this.audio.unlockAudioContext();
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onGlobalTouchStart(e: TouchEvent): void {
    this.unlockAudioOnFirstGesture();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      this.spawnClickHearts(touch.clientX, touch.clientY);
    }
  }

  @HostListener('click', ['$event'])
  onGlobalClick(e: MouseEvent): void {
    this.unlockAudioOnFirstGesture();
    if (e.clientX && e.clientY) {
      this.spawnClickHearts(e.clientX, e.clientY);
    }
  }

  public spawnClickHearts(x: number, y: number): void {
    if (this.clickHearts.length > 14) return;
    const emojis = ['💖', '💕', '❤️', '🥰', '✨', '🌹', '💓'];
    for (let i = 0; i < 2; i++) {
      const p = {
        id: ++this.clickHeartCounter,
        x: x + (Math.random() * 26 - 13),
        y: y + (Math.random() * 26 - 13),
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      };
      this.clickHearts.push(p);
      setTimeout(() => {
        this.clickHearts = this.clickHearts.filter(h => h.id !== p.id);
      }, 1000);
    }
  }

  // --- Rain of Hearts Shower Button ---
  public triggerHeartShower(): void {
    this.audio.playMagicSparkle();
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff4d8d', '#ff1493', '#ffd700', '#ff85a2']
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff4d8d', '#ff1493', '#ffd700', '#ff85a2']
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
    this.showToast('Shower of Hearts! 🌧️💖 Dilon ki baarish!');
    this.tracker.logAction('game', 'Triggered Rain of Hearts Shower 🌧️💖');
  }

  // --- Activity 1: Spin Love Wheel ---
  public spinLoveWheel(): void {
    if (this.isSpinningWheel) return;
    this.isSpinningWheel = true;
    this.wheelResult = null;
    this.audio.playFunBoing();

    const spins = 5 + Math.floor(Math.random() * 3);
    const randomExtra = Math.floor(Math.random() * 360);
    const totalRotation = spins * 360 + randomExtra;
    this.wheelRotation += totalRotation;

    let soundTicks = 0;
    const tickInterval = setInterval(() => {
      this.audio.playTone(600 + (soundTicks % 5) * 60, 0.04, 'sine', 0.05);
      soundTicks++;
      if (soundTicks > 24) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      this.isSpinningWheel = false;
      const normalized = (360 - (this.wheelRotation % 360)) % 360;
      const slice = 360 / this.wheelOptions.length;
      const index = Math.floor(normalized / slice) % this.wheelOptions.length;
      this.wheelResult = this.wheelOptions[index];
      this.audio.playCelebrationFanfare();
      this.launchHeartBurst();
      this.tracker.logAction('game', `Spun Love Wheel: Won "${this.wheelResult.label}" 🎡`, {
        reward: this.wheelResult.label,
        description: this.wheelResult.desc
      });
    }, 3200);
  }

  // --- Activity 2: Virtual Hug Charger ---
  public startChargingHug(): void {
    if (this.hugSent) return;
    this.isChargingHug = true;
    this.hugProgress = 0;
    this.audio.playHeartbeat();

    this.hugInterval = setInterval(() => {
      if (this.hugProgress < 100) {
        this.hugProgress += 4;
        if (this.hugProgress % 20 === 0) {
          this.audio.playHeartbeat();
          this.audio.playTone(400 + this.hugProgress * 4, 0.08, 'sine', 0.06);
        }
      } else {
        this.completeHug();
      }
    }, 80);
  }

  public stopChargingHug(): void {
    if (this.hugSent) return;
    this.isChargingHug = false;
    if (this.hugInterval) {
      clearInterval(this.hugInterval);
      this.hugInterval = null;
    }
    if (this.hugProgress >= 100) {
      this.completeHug();
    } else {
      this.hugProgress = 0;
    }
  }

  public completeHug(): void {
    if (this.hugSent) return;
    this.hugSent = true;
    this.isChargingHug = false;
    if (this.hugInterval) {
      clearInterval(this.hugInterval);
      this.hugInterval = null;
    }
    this.audio.playCelebrationFanfare();
    this.launchHeartBurst();
    this.showToast('1000% Warm Hug Sent Across The Miles! 🤗❤️');
    this.tracker.logAction('game', 'Completed 1000% Virtual Hug across the miles 🤗❤️');
  }

  public resetHug(): void {
    this.hugSent = false;
    this.hugProgress = 0;
  }

  // --- Activity 3: Drama & Mood Fixer ---
  public selectDrama(tab: 'hangry' | 'late_reply' | 'attention' | 'love_me'): void {
    this.activeDramaTab = tab;
    this.audio.playCutePop();
    this.launchHeartBurst();
    this.tracker.logAction('game', `Checked Mood Fixer: ${this.dramaSolutions[tab]?.title || tab} 🍟`, { moodTab: tab });
  }

  // --- Activity 4: Quiz ---
  public answerQuiz(qIndex: number, opt: any): void {
    const q = this.quizQuestions[qIndex];
    q.answered = true;
    q.selectedFeedback = opt.feedback;
    this.audio.playCutePop();
    this.launchHeartBurst();
    this.tracker.logAction('game', `Answered Couple Quiz Q#${qIndex + 1}`, {
      question: q.q,
      selectedAnswer: opt.text,
      feedback: opt.feedback
    });
  }

  public get isQuizComplete(): boolean {
    return this.quizQuestions.every(q => q.answered);
  }

  public resetQuiz(): void {
    this.quizQuestions.forEach(q => {
      q.answered = false;
      q.selectedFeedback = '';
    });
  }

  // ====================================================
  // GAME 5: Boyfriend Excuse Generator 🤖🎭
  // ====================================================
  public excuseCategory: 'late' | 'confused' | 'staring' | 'sleepy' = 'late';
  public excuseGuiltyCount = 0;
  public readonly excuseDictionary = {
    late: [
      {
        reason: 'I was busy drafting a 12-page romantic poem, but accidentally erased it all while searching for the 🥺 emoji!',
        penalty: 'Boyfriend must record a 30-second audio singing Kesariya out of tune!',
        emoji: '📱',
        status: 'VERDICT: 100% Caught Red-Handed'
      },
      {
        reason: 'I opened your photo to reply, got hypnotized by your smile, and thought I already replied in my head!',
        penalty: 'Boyfriend owes girlfriend midnight dessert delivery on our next reunion!',
        emoji: '🤤',
        status: 'VERDICT: Spellbound By Girlfriend'
      },
      {
        reason: 'My thumbs went into power-saving mode because your beauty drew all electrical power from the room!',
        penalty: '50 Forehead kisses penalty + Queen pampering for 2 days!',
        emoji: '⚡',
        status: 'VERDICT: Guilty of Extreme Cheesy Excuses'
      },
      {
        reason: 'Phone fell directly on my face while smiling at your text in bed. Medical recovery took 15 minutes!',
        penalty: 'Boyfriend must send 5 goofy double-chin selfies right now!',
        emoji: '🤕',
        status: 'VERDICT: Clumsy Boyfriend Alert'
      }
    ],
    confused: [
      {
        reason: 'My single remaining brain cell was occupied replaying our 24 Feb 2026 meeting on loop like an IMAX film!',
        penalty: 'Boyfriend must admit girlfriend is 1000% right about everything!',
        emoji: '🤯',
        status: 'VERDICT: Hopelessly In Love'
      },
      {
        reason: 'Your angelic gaze temporarily wiped my short-term memory. Science calls this the "Girlfriend Amnesia Effect"!',
        penalty: 'Boyfriend must write a 4-line funny shayari dedicated to her pouting face!',
        emoji: '😇',
        status: 'VERDICT: Charmingly Defenseless'
      }
    ],
    staring: [
      {
        reason: 'Looking away from you is scientifically proven to decrease life happiness by 99.9%!',
        penalty: 'Girlfriend gets unlimited cheek squishing privileges without complaints!',
        emoji: '👀',
        status: 'VERDICT: Permanent Eye-Lock Activated'
      },
      {
        reason: 'I was checking if you are actually human or an angel that accidentally wandered down to earth on 24 Feb!',
        penalty: 'Boyfriend must say "I love you" 10 times with increasing dramatic emotion!',
        emoji: '🪽',
        status: 'VERDICT: Extreme Romantic Flattery'
      }
    ],
    sleepy: [
      {
        reason: 'I didn\'t want our call to end, but my eyelids physically betrayed me while listening to your sweet voice!',
        penalty: 'Boyfriend must send a super sweet good morning voice note before she wakes up!',
        emoji: '😴',
        status: 'VERDICT: Sleeping Panda Syndrome'
      },
      {
        reason: 'I had to hurry to sleep so I could meet you in my dreams across the miles faster!',
        penalty: 'Pancakes and warm tea in bed promised on next meetup!',
        emoji: '🌙',
        status: 'VERDICT: Dreamland Teleportation'
      }
    ]
  };
  public currentExcuse: any = this.excuseDictionary.late[0];

  public setExcuseCategory(cat: 'late' | 'confused' | 'staring' | 'sleepy'): void {
    this.excuseCategory = cat;
    this.generateBoyfriendExcuse();
  }

  public generateBoyfriendExcuse(): void {
    this.audio.playFunBoing();
    const list = this.excuseDictionary[this.excuseCategory];
    let next = list[Math.floor(Math.random() * list.length)];
    if (list.length > 1 && next.reason === this.currentExcuse?.reason) {
      next = list.find(e => e.reason !== this.currentExcuse.reason) || next;
    }
    this.currentExcuse = next;
    this.excuseGuiltyCount++;
    this.tracker.logAction('game', `Generated Excuse (${this.excuseCategory}): "${this.currentExcuse.reason.slice(0, 50)}..." 🤖`, {
      category: this.excuseCategory,
      reason: this.currentExcuse.reason,
      penalty: this.currentExcuse.penalty,
      verdict: this.currentExcuse.status
    });
  }

  public pleadGuilty(): void {
    this.audio.playCelebrationFanfare();
    this.launchHeartBurst();
    this.showToast('Boyfriend pleads 100% GUILTY! Penalty accepted with love! 🥺❤️');
    this.tracker.logAction('game', 'Boyfriend Pleaded 100% Guilty to Penalty 🥺', {
      penalty: this.currentExcuse?.penalty
    });
  }

  public forgiveBoyfriend(): void {
    this.audio.playHarpChime();
    this.launchHeartBurst();
    this.showToast('Boyfriend is forgiven for now... until the next late reply! 😉💖');
    this.tracker.logAction('game', 'Girlfriend Forgave Boyfriend for Excuse 💖');
  }

  // ====================================================
  // GAME 6: Love Dares & Romantic Truths 🎲🌶️
  // ====================================================
  public dareMode: 'dare_cute' | 'dare_funny' | 'truth' = 'dare_cute';
  public isCardFlipped = true;
  public dareCompletionCount = 0;
  public readonly dareDeck = {
    dare_cute: [
      { title: 'The Sweetest Audio', prompt: 'Record a 20-second voice note saying "You are my favorite person in the entire universe" in the warmest whisper!', emoji: '🎙️', badge: 'Cute Audio Dare' },
      { title: 'Pinky Promise', prompt: 'Make a pinky promise on call: When we meet at the airport/station, we will not let go of each other\'s hands for at least 30 minutes!', emoji: '🤙', badge: 'Reunion Dare' },
      { title: 'First Photo Hunt', prompt: 'Find the very first photo you took together or sent each other on 24 Feb 2026 and send it right now with your favorite memory!', emoji: '📸', badge: 'Nostalgia Dare' },
      { title: 'Nickname Marathon', prompt: 'Call each other by 5 brand new silly romantic nicknames in a row without laughing!', emoji: '🌸', badge: 'Sweet Names Dare' }
    ],
    dare_funny: [
      { title: 'Bollywood Villain Love', prompt: 'Confess your love in a dramatic Bollywood villain voice: "Tum meri ho, Mogambo khush hua!" 😂', emoji: '🎬', badge: 'Hilarious Dare' },
      { title: 'Derpy Face Selfie', prompt: 'Take a goofy double-chin selfie right now and set it as your chat wallpaper for 2 hours!', emoji: '🤪', badge: 'Goofy Selfie Dare' },
      { title: 'Queen Declaration', prompt: 'Send this exact text right now: "I hereby officially declare you the undisputed ruler of my life, Queen!" 👑', emoji: '👑', badge: 'Surrender Dare' },
      { title: 'Snack Rap Battle', prompt: 'Invent a 4-line freestyle rap about how much you miss eating snacks together across the miles!', emoji: '🎤', badge: 'Rap Dare' }
    ],
    truth: [
      { title: 'The 24 Feb First Spark', prompt: 'What was the exact thought that flashed in your head the very second our eyes locked on 24 February 2026?', emoji: '⚡', badge: 'Memory Truth' },
      { title: 'Secret Screenshot Habit', prompt: 'Have you ever secretly taken a screenshot on a video call because the other person looked ridiculously cute? (Admit it!)', emoji: '📸', badge: 'Cute Secret Truth' },
      { title: 'The Moment You Fell', prompt: 'When was the exact moment you realized you were completely, hopelessly in love and there was no turning back?', emoji: '💘', badge: 'Deep Soul Truth' },
      { title: '24-Hour Reunion Plan', prompt: 'If we had only 24 hours together before the next flight, what is the #1 thing you want to do with me?', emoji: '✈️', badge: 'Reunion Truth' }
    ]
  };
  public currentDareCard: any = this.dareDeck.dare_cute[0];

  public setDareMode(mode: 'dare_cute' | 'dare_funny' | 'truth'): void {
    this.dareMode = mode;
    this.drawDareCard();
  }

  public drawDareCard(): void {
    this.audio.playTone(700, 0.15, 'triangle', 0.1);
    this.isCardFlipped = false;
    setTimeout(() => {
      const list = this.dareDeck[this.dareMode];
      let card = list[Math.floor(Math.random() * list.length)];
      if (list.length > 1 && card.title === this.currentDareCard?.title) {
        card = list.find(c => c.title !== this.currentDareCard.title) || card;
      }
      this.currentDareCard = card;
      this.isCardFlipped = true;
      this.audio.playCutePop();
      this.tracker.logAction('game', `Drew Dare / Truth Card: "${this.currentDareCard.title}" 🎲`, {
        mode: this.dareMode,
        title: this.currentDareCard.title,
        prompt: this.currentDareCard.prompt
      });
    }, 200);
  }

  public completeDare(): void {
    this.dareCompletionCount++;
    this.audio.playCelebrationFanfare();
    this.launchHeartBurst();
    this.showToast('Dare / Truth Completed! Romance level upgraded! 🌹✨');
    this.tracker.logAction('game', `Completed Dare: "${this.currentDareCard?.title || 'Truth / Dare'}" 🎯`, {
      mode: this.dareMode,
      card: this.currentDareCard
    });
  }

  // ====================================================
  // GAME 7: Who Is More Likely To...? 🏆👫
  // ====================================================
  public battleIndex = 0;
  public readonly battleScenarios = [
    {
      q: 'Who falls asleep first on a 1 AM video call while insisting "I\'m not sleepy at all"?',
      himPercent: 92,
      herPercent: 8,
      verdict: 'Boyfriend is 100% guilty! He claims he was just "resting his eyelids" while gently snoring! 😴😂'
    },
    {
      q: 'Who stares at a wardrobe full of clothes and dramatically sighs "I have NOTHING to wear"?',
      himPercent: 6,
      herPercent: 94,
      verdict: 'Certified Girlfriend moment! Takes 4 trial outfits before feeling 10/10 angelic! 👗✨'
    },
    {
      q: 'Who turns into a ferocious hungry tiger if dinner arrives 10 minutes late?',
      himPercent: 15,
      herPercent: 85,
      verdict: 'Code Hangry! Emergency french fries and chocolate dispatched immediately! 🍟🦖'
    },
    {
      q: 'Who will cry the biggest, happiest waterfalls of tears when we hug at the arrivals gate?',
      himPercent: 80,
      herPercent: 88,
      verdict: 'Both! An unbreakable panda embrace with happy tears flowing! 🥺✈️❤️'
    },
    {
      q: 'Who secretly stalks the other person\'s photos at 2 AM and smiles like an idiot?',
      himPercent: 95,
      herPercent: 85,
      verdict: 'Mutual soulmate stalking! Neither can stop staring at each other\'s smiles! 📸🥰'
    },
    {
      q: 'Who gets dramatically lost even while Google Maps is talking right to them?',
      himPercent: 45,
      herPercent: 55,
      verdict: 'Lost in the city, but never lost in love! 🗺️😆'
    }
  ];
  public battleVotes: { [key: number]: 'him' | 'her' } = {};

  public voteBattle(choice: 'him' | 'her'): void {
    this.battleVotes[this.battleIndex] = choice;
    this.audio.playCutePop();
    this.launchHeartBurst();
    this.tracker.logAction('game', `Voted in Who Is More Likely: "${choice === 'him' ? 'Him (Boyfriend)' : 'Her (Girlfriend)'}" 👫`, {
      question: this.currentBattle?.q,
      vote: choice,
      verdict: this.currentBattle?.verdict
    });
  }

  public nextBattleScenario(): void {
    this.audio.playTone(600, 0.12, 'sine', 0.08);
    this.battleIndex = (this.battleIndex + 1) % this.battleScenarios.length;
  }

  public prevBattleScenario(): void {
    this.audio.playTone(550, 0.12, 'sine', 0.08);
    this.battleIndex = (this.battleIndex - 1 + this.battleScenarios.length) % this.battleScenarios.length;
  }

  public get currentBattle(): any {
    return this.battleScenarios[this.battleIndex];
  }

  // ====================================================
  // GAME 8: Love Compatibility Fingerprint Scanner 💖👆
  // ====================================================
  public isFingerprintScanning = false;
  public fingerprintProgress = 0;
  public fingerprintResult: any = null;
  private fingerprintInterval: any = null;

  public startFingerprintScan(): void {
    if (this.fingerprintResult) return;
    this.isFingerprintScanning = true;
    this.fingerprintProgress = 0;
    this.audio.playScanChirp(0);

    let tick = 0;
    this.fingerprintInterval = setInterval(() => {
      if (this.fingerprintProgress < 100) {
        this.fingerprintProgress += 5;
        tick++;
        if (tick % 4 === 0) {
          this.audio.playScanChirp(Math.floor(tick / 4));
        }
      } else {
        this.completeFingerprintScan();
      }
    }, 90);
  }

  public stopFingerprintScan(): void {
    if (this.fingerprintResult) return;
    this.isFingerprintScanning = false;
    if (this.fingerprintInterval) {
      clearInterval(this.fingerprintInterval);
      this.fingerprintInterval = null;
    }
    if (this.fingerprintProgress >= 100) {
      this.completeFingerprintScan();
    } else {
      this.fingerprintProgress = 0;
    }
  }

  public completeFingerprintScan(): void {
    this.isFingerprintScanning = false;
    if (this.fingerprintInterval) {
      clearInterval(this.fingerprintInterval);
      this.fingerprintInterval = null;
    }
    this.fingerprintProgress = 100;
    this.fingerprintResult = {
      score: '1000%',
      match: 'INFINITE COSMIC SOULMATES 💥',
      diagnosis: 'Incurably in love since 24 Feb 2026. Complete zero immunity to girlfriend\'s smile and cute pouts.',
      prescription: 'Unlimited forehead kisses, mandatory daily video calls, and a lifetime of devotion! 💍',
      badge: '👑 CERTIFIED DESTINY'
    };
    this.audio.playCelebrationFanfare();
    this.launchHeartBurst();
    this.tracker.logAction('game', 'Completed Biometric Soulmate Scan (1000% Infinite Match) 🫆✨', {
      score: '1000%',
      match: 'INFINITE COSMIC SOULMATES'
    });
  }

  public resetFingerprintScan(): void {
    this.fingerprintProgress = 0;
    this.fingerprintResult = null;
    this.audio.playCutePop();
  }

  // ====================================================
  // GAME 9: Catch The Flying Kisses & Hearts! 💋🎮
  // ====================================================
  public isKissGameActive = false;
  public kissGameScore = 0;
  public kissGameTimeLeft = 20;
  public kissGameFinished = false;
  public spawnedKisses: Array<{ id: number; x: number; y: number; emoji: string; points: number; text: string }> = [];
  private kissGameTimer: any = null;
  private kissSpawnInterval: any = null;
  private kissCounter = 0;

  public startKissGame(): void {
    this.isKissGameActive = true;
    this.kissGameFinished = false;
    this.kissGameScore = 0;
    this.kissGameTimeLeft = 20;
    this.spawnedKisses = [];
    this.audio.playCelebrationFanfare();
    this.tracker.logAction('game', 'Started Catch The Flying Kisses Game 💋🎮');

    this.kissGameTimer = setInterval(() => {
      this.kissGameTimeLeft--;
      if (this.kissGameTimeLeft <= 0) {
        this.endKissGame();
      }
    }, 1000);

    const kissItems = [
      { emoji: '💋', points: 2, text: '+2 Kiss!' },
      { emoji: '💖', points: 1, text: '+1 Love!' },
      { emoji: '🌹', points: 3, text: '+3 Rose!' },
      { emoji: '💍', points: 5, text: '+5 Diamond!' },
      { emoji: '🧅', points: -2, text: '-2 Onion!' }
    ];

    this.kissSpawnInterval = setInterval(() => {
      if (!this.isKissGameActive) return;
      if (this.spawnedKisses.length < 7) {
        const item = kissItems[Math.floor(Math.random() * kissItems.length)];
        const newKiss = {
          id: ++this.kissCounter,
          x: Math.floor(Math.random() * 76 + 12),
          y: Math.floor(Math.random() * 56 + 22),
          emoji: item.emoji,
          points: item.points,
          text: item.text
        };
        this.spawnedKisses.push(newKiss);

        setTimeout(() => {
          this.spawnedKisses = this.spawnedKisses.filter(k => k.id !== newKiss.id);
        }, 2200);
      }
    }, 550);
  }

  public catchKiss(kiss: any, event: MouseEvent | TouchEvent): void {
    if (event.cancelable) event.preventDefault();
    if (!this.isKissGameActive) return;

    this.spawnedKisses = this.spawnedKisses.filter(k => k.id !== kiss.id);
    this.kissGameScore = Math.max(0, this.kissGameScore + kiss.points);

    if (kiss.points > 0) {
      this.audio.playKissSound();
    } else {
      this.audio.playDodgeSound();
    }
  }

  public endKissGame(): void {
    this.isKissGameActive = false;
    this.kissGameFinished = true;
    this.spawnedKisses = [];

    if (this.kissGameTimer) clearInterval(this.kissGameTimer);
    if (this.kissSpawnInterval) clearInterval(this.kissSpawnInterval);

    this.audio.playCelebrationFanfare();
    this.launchGrandConfettiCelebration();
    this.tracker.logAction('game', `Finished Kiss Arcade with Score: ${this.kissGameScore} 💋🎮`, {
      score: this.kissGameScore
    });
  }

  public resetKissGame(): void {
    this.isKissGameActive = false;
    this.kissGameFinished = false;
    this.kissGameScore = 0;
    this.kissGameTimeLeft = 20;
    this.spawnedKisses = [];
    if (this.kissGameTimer) clearInterval(this.kissGameTimer);
    if (this.kissSpawnInterval) clearInterval(this.kissSpawnInterval);
  }

  // ====================================================
  // GAME 10: Romantic Bucket List Scratch Cards 🎫✨
  // ====================================================
  public bucketListItems = [
    {
      id: 1,
      title: 'Midnight Stargazing Under One Blanket',
      desc: 'Lying side-by-side in a quiet meadow or terrace, pointing out constellations while holding hands.',
      emoji: '🌌',
      badge: 'Romantic Night',
      revealed: false,
      completed: false
    },
    {
      id: 2,
      title: 'Kitchen Pasta & Slow Dance Battle',
      desc: 'Boiling pasta together, spilling a little flour, and slow dancing barefoot with no music playing.',
      emoji: '🍝',
      badge: 'Cozy Domestic',
      revealed: false,
      completed: false
    },
    {
      id: 3,
      title: 'Spontaneous 2 AM Airport Road Trip',
      desc: 'Packing a single backpack and driving at midnight just to watch the sunrise over the horizon together.',
      emoji: '✈️',
      badge: 'Wild Adventure',
      revealed: false,
      completed: false
    },
    {
      id: 4,
      title: 'Rainy Day Chai & Blanket Fortress',
      desc: 'Hot ginger chai, warm pakoras, and building a blanket fort to watch movies all afternoon.',
      emoji: '☕',
      badge: 'Rainy Bliss',
      revealed: false,
      completed: false
    },
    {
      id: 5,
      title: 'Secret Notes in Cozy Bookstore',
      desc: 'Getting lost in a sleepy old bookstore and slipping love notes between the pages of favorite novels.',
      emoji: '📚',
      badge: 'Quiet Magic',
      revealed: false,
      completed: false
    },
    {
      id: 6,
      title: 'Barefoot Twilight Beach Walk',
      desc: 'Walking along the tide at sunset, feeling cold waves splash our ankles, and leaving double footprints.',
      emoji: '🏖️',
      badge: 'Sunset Dream',
      revealed: false,
      completed: false
    },
    {
      id: 7,
      title: '100 Memories Wall Photo Collage',
      desc: 'Printing 100 candid polaroids of our laughs, video call screenshots, and pinning them above our bed.',
      emoji: '📸',
      badge: 'Forever Wall',
      revealed: false,
      completed: false
    },
    {
      id: 8,
      title: 'The Unbreakable Arrivals Gate Hug',
      desc: 'Dropping all bags in the middle of airport arrivals and hugging for a minimum of 10 solid minutes!',
      emoji: '🫂',
      badge: 'Reunion Vow',
      revealed: true,
      completed: false
    }
  ];

  public revealBucketItem(item: any): void {
    if (!item.revealed) {
      item.revealed = true;
      this.audio.playMagicSparkle();
      this.launchHeartBurst();
      this.tracker.logAction('game', `Revealed Bucket List Dream: "${item.title}" 🎫✨`);
    }
  }

  public toggleBucketCompleted(item: any): void {
    item.completed = !item.completed;
    if (item.completed) {
      this.audio.playCelebrationFanfare();
      this.launchHeartBurst();
      this.showToast(`Marked as Vow: ${item.title}! 💖`);
      this.tracker.logAction('game', `Added Bucket List Vow: "${item.title}" ✅`, { title: item.title });
    }
  }

  // ====================================================
  // GAME 11: Magic Heart Fortune Cookie / Love Oracle 🥠🔮
  // ====================================================
  public isCookieCracked = false;
  public isCrackingCookie = false;
  public readonly fortunePredictions = [
    {
      title: 'Prophecy of Arrival Hug ✈️🫂',
      fortune: 'The stars declare: The moment you two meet at the arrivals gate, boyfriend will spin you around and hold you so tight that every single mile of waiting will evaporate into pure joy!',
      luckScore: '1000% Soulmate Destiny',
      emoji: '✈️'
    },
    {
      title: 'Prophecy of The Pouting Queen 👑🍫',
      fortune: 'The ancient love scrolls state: In all future silly arguments, girlfriend is legally and scientifically 100% right! Boyfriend will instantly admit defeat with chocolate and forehead kisses!',
      luckScore: '100% Queen Supremacy',
      emoji: '👑'
    },
    {
      title: 'Prophecy of The Cozy Kitchen 🏡☕',
      fortune: 'Cosmic oracle sees: Sunday mornings filled with the aroma of warm pancakes, silly flour fights in the kitchen, and dancing barefoot to your favorite Bollywood romance songs!',
      luckScore: 'Infinite Warmth & Laughter',
      emoji: '🥞'
    },
    {
      title: 'Prophecy of The 24 Feb Eternal Spark 💍✨',
      fortune: 'The universe whispered: 24 February 2026 was not just an ordinary date; it was the day two wandering stars locked orbits. Your love will grow deeper, sweeter, and more unshakeable with every passing year!',
      luckScore: 'Written in The Cosmos',
      emoji: '💎'
    },
    {
      title: 'Prophecy of The Midnight Ice Cream Run 🍦🚗',
      fortune: 'A spontaneous sweet craving will hit at 1:30 AM in the future, and boyfriend will happily drive across the city in pajama pants just to see your eyes light up with that gorgeous smile!',
      luckScore: '100% Guaranteed Pampering',
      emoji: '🍨'
    },
    {
      title: 'Prophecy of Golden Years & Rocking Chairs 👵🧓',
      fortune: 'Decades from now, when both your heads are crowned with silver hair, you will sit on a warm porch holding hands, laughing at how crazy in love you were on 24 Feb 2026, still feeling the exact same butterflies!',
      luckScore: 'Lifetime Warranty on Love',
      emoji: '🪑'
    }
  ];
  public currentFortune: any = this.fortunePredictions[0];

  public crackFortuneCookie(): void {
    if (this.isCrackingCookie) return;
    this.isCrackingCookie = true;
    this.audio.playCutePop();

    setTimeout(() => {
      let next = this.currentFortune;
      while (next.title === this.currentFortune.title && this.fortunePredictions.length > 1) {
        next = this.fortunePredictions[Math.floor(Math.random() * this.fortunePredictions.length)];
      }
      this.currentFortune = next;
      this.isCookieCracked = true;
      this.isCrackingCookie = false;
      this.audio.playCelebrationFanfare();
      this.launchGrandConfettiCelebration();
      this.tracker.logAction('game', `Cracked Love Fortune Cookie: "${this.currentFortune.title}" 🥠🔮`, {
        fortune: this.currentFortune.fortune,
        luckScore: this.currentFortune.luckScore
      });
    }, 700);
  }

  public resetFortuneCookie(): void {
    this.isCookieCracked = false;
    this.audio.playTone(600, 0.1, 'sine', 0.05);
  }

  // ====================================================
  // GAME 12: Infinite Sweet Compliment Machine & Love Meter 💌⚡
  // ====================================================
  public readonly complimentsList = [
    'Your smile has a 100% proven success rate of melting all my stress within 0.2 seconds! 🫠✨',
    'The way your eyes crinkle when you laugh uncontrollably is officially the 8th wonder of the world! 👀❤️',
    'Even when you wake up looking like a sleepy disheveled panda, you are the most breathtaking girl alive! 🐼💖',
    'Your heart is so gentle, warm, and pure that angels take notes whenever you speak kindly! 🪽🌸',
    'You are simultaneously my quiet sanctuary and my greatest, most exciting adventure! 🏡🎢',
    'If beauty was measured in stars, you would be an entire radiant galaxy all by yourself! 🌌',
    'I swear, even when you are angrily pouting with folded arms, you look dangerously adorable! 🥺',
    'Your laughter is my favorite song in the entire universe. Spotify could never compete! 🎶',
    'The intelligence, kindness, and grace you carry yourself with makes me so ridiculously proud to be yours! 👑',
    'Looking at your picture is the only battery recharge my soul needs on a tiring day! 🔋❤️',
    'You make even the most boring grocery runs or traffic jams feel like the best date of the century! 🛒',
    'My heart knew it was home the very first second our eyes locked on 24 February 2026! 🌹💍',
    'You are the only person I would happily give the very last bite of my favorite pizza to! 🍕',
    'You have this magical superpower of making anyone who talks to you feel special and valued! 🪄',
    'No love poem ever written by Shakespeare or Ghalib comes close to describing how rare you are! 📜'
  ];
  public currentCompliment = this.complimentsList[0];
  public loveMeterPercent = 100;
  public complimentCount = 0;

  public generateCompliment(): void {
    this.audio.playCutePop();
    let next = this.currentCompliment;
    while (next === this.currentCompliment && this.complimentsList.length > 1) {
      next = this.complimentsList[Math.floor(Math.random() * this.complimentsList.length)];
    }
    this.currentCompliment = next;
    this.complimentCount++;
    this.loveMeterPercent = Math.min(1000, this.loveMeterPercent + 60);

    if (this.loveMeterPercent >= 1000) {
      this.audio.playCelebrationFanfare();
      this.launchHeartBurst();
      this.showToast('🚨 DANGER: Love Meter Overloaded! 1000% Infinite Romance! 💥❤️');
    } else {
      this.launchHeartBurst();
    }

    this.tracker.logAction('game', `Generated Compliment: "${this.currentCompliment.slice(0, 45)}..." 💌⚡`, {
      meter: `${this.loveMeterPercent}%`,
      compliment: this.currentCompliment
    });
  }

  public resetLoveMeter(): void {
    this.loveMeterPercent = 100;
    this.audio.playTone(500, 0.1, 'sine', 0.05);
  }

  // ====================================================
  // GAME 13: Boyfriend Apology & Penalty Generator 🥺💐
  // ====================================================
  public activeApologyReason: string = 'late_reply';
  public isApologyRevealed = false;
  public isBoyfriendForgiven = false;

  public readonly apologyScenarios: { [key: string]: { label: string; confession: string; penalty: string; pledge: string; emoji: string } } = {
    late_reply: {
      label: 'Late Reply by 3 Minutes 📱',
      emoji: '📱',
      confession: 'Boyfriend officially pleads 1000% guilty! I was either staring mesmerized at your photo, my phone lagged, or I was typing a 5-paragraph love speech. Making you wait for even 180 seconds is an unforgivable crime against romance!',
      penalty: 'Penalty: Boyfriend must send 10 silly selfies pouting, a voice note singing your favorite Bollywood romantic track, and 50 forehead kisses on next meetup!',
      pledge: 'Pledge: "From this moment forward, girlfriend\'s notifications have supreme high priority over everything in the cosmos!"'
    },
    no_listen: {
      label: 'Did Not Listen with 100% Focus 😤',
      emoji: '👂',
      confession: 'Boyfriend\'s single brain cell lost connection for 3 seconds while you were talking! Every single word that comes out of your angelic mouth is sacred, and not paying 1000% attention is totally unforgivable!',
      penalty: 'Penalty: Full 60 minutes of uninterrupted listening on call where girlfriend talks about anything and boyfriend only nods saying "Yes my Queen, you are so right"!',
      pledge: 'Pledge: "All radio frequencies and brain waves locked 100% exclusively on girlfriend whenever she speaks!"'
    },
    random_mad: {
      label: 'Girlfriend Mad With Zero Reason 🥺',
      emoji: '👑',
      confession: 'A true Queen never needs a reason to be angry! The weather is wrong, the universe is wrong, gravity is wrong, boyfriend is wrong, girlfriend is legally, scientifically 100% right!',
      penalty: 'Penalty: Boyfriend must immediately dispatch chocolate, dessert, loaded fries, and unconditional cuddles without asking any questions!',
      pledge: 'Pledge: "Boyfriend bows down and surrenders unconditionally to her majesty\'s mood!"'
    },
    low_praise: {
      label: 'Did Not Compliment Enough Today 👸',
      emoji: '✨',
      confession: 'How could I look at the 8th Wonder of the World and forget to worship her beauty out loud today? You look like a literal angel sculpted from starlight and rose petals!',
      penalty: 'Penalty: Must write 15 personalized poetic reasons why she is the most breathtaking woman in the solar system!',
      pledge: 'Pledge: "Minimum 10 compliments per day guaranteed with lifetime warranty!"'
    },
    ate_food: {
      label: 'Ate The Best Bite of Food Yourself 🍕',
      emoji: '🍕',
      confession: 'I committed high treason against romance! The crunchiest French fry, the center slice of pizza, and the last scoop of ice cream belong solely to my girlfriend!',
      penalty: 'Penalty: Boyfriend must cook or order girlfriend her dream dinner and surrender all food rights for 7 days!',
      pledge: 'Pledge: "Girlfriend gets the first bite, the best bite, and the last bite forever!"'
    },
    sleep_early: {
      label: 'Fell Asleep While You Were Talking 😴',
      emoji: '💤',
      confession: 'I accidentally dozed off listening to your soothing sweet voice! It felt so safe and peaceful that my body went into deep hibernation!',
      penalty: 'Penalty: 100 sweet morning voice notes + breakfast in bed delivery voucher!',
      pledge: 'Pledge: "No sleeping allowed until girlfriend says: \'Okay my love, you may sleep now\'!"'
    }
  };

  public get apologyKeys(): string[] {
    return Object.keys(this.apologyScenarios);
  }

  public get currentApology(): any {
    return this.apologyScenarios[this.activeApologyReason] || this.apologyScenarios['late_reply'];
  }

  public selectApologyReason(key: string): void {
    this.activeApologyReason = key;
    this.isApologyRevealed = true;
    this.isBoyfriendForgiven = false;
    this.audio.playCutePop();
  }

  public forgiveBoyfriendApology(): void {
    this.isBoyfriendForgiven = true;
    this.audio.playCelebrationFanfare();
    this.launchGrandConfettiCelebration();
    this.showToast('❤️ Boyfriend Forgiven! Penalty officially active! 🤗✨');
    this.tracker.logAction('game', `Girlfriend Forgave Boyfriend for "${this.currentApology.label}" 🥺❤️`, {
      reason: this.activeApologyReason,
      penalty: this.currentApology.penalty
    });
  }

  // ====================================================
  // GAME 14: Our Virtual Love Blossom (Pyaar Ka Paudha) 🌱🌸
  // ====================================================
  public lovePlantCareLevel = 25; // 0 to 100
  public plantCareMessage = 'Our love was planted on 24 Feb 2026! Shower it with care to make it bloom!';

  public get lovePlantStage(): number {
    if (this.lovePlantCareLevel >= 100) return 3; // Golden Glowing Rose
    if (this.lovePlantCareLevel >= 75) return 2;  // Budding Rose
    if (this.lovePlantCareLevel >= 50) return 1;  // Growing Stem
    return 0; // Sprout
  }

  public careForPlant(action: 'water' | 'sun' | 'whisper' | 'hug'): void {
    const prev = this.lovePlantCareLevel;
    this.lovePlantCareLevel = Math.min(100, this.lovePlantCareLevel + 25);

    if (action === 'water') {
      this.audio.playTone(650, 0.2, 'sine', 0.08);
      this.plantCareMessage = '💧 Watered with pure devotion and daily care!';
    } else if (action === 'sun') {
      this.audio.playTone(800, 0.2, 'triangle', 0.08);
      this.plantCareMessage = '☀️ Warmed with golden sunshine and sweet smiles!';
    } else if (action === 'whisper') {
      this.audio.playHarpChime();
      this.plantCareMessage = '💬 Whispered: "You are the love of my life!"';
    } else {
      this.audio.playCelebrationFanfare();
      this.plantCareMessage = '🫂 Wrapped in a long-distance, unbreakable warm hug!';
    }

    if (this.lovePlantCareLevel >= 100 && prev < 100) {
      this.launchGrandConfettiCelebration();
      this.showToast('🌹 FULL BLOOM! Our love is radiant, eternal, and unfading! ✨');
      this.tracker.logAction('game', 'Bloomed Virtual Love Rose to 100% Full Bloom 🌹✨');
    } else {
      this.launchHeartBurst();
      this.tracker.logAction('game', `Cared for Love Plant: ${action.toUpperCase()} (${this.lovePlantCareLevel}%) 🌱`);
    }
  }

  public resetPlant(): void {
    this.lovePlantCareLevel = 25;
    this.plantCareMessage = 'Re-seeded with love! Nurture it once again! 🌱';
    this.audio.playTone(500, 0.1, 'sine', 0.05);
  }

  // ====================================================
  // GAME 15: Love Memory Match (Romantic Emoji Flip) 🃏💖
  // ====================================================
  public memoryCards: { id: number; emoji: string; flipped: boolean; matched: boolean }[] = [];
  public memoryMoves = 0;
  public memoryMatches = 0;
  public isMemoryWon = false;
  private flippedCardIndices: number[] = [];
  public isCheckingMemoryMatch = false;

  public initMemoryGame(): void {
    const emojis = ['🌹', '💍', '💌', '🧸', '🍫', '✈️'];
    const deck = [...emojis, ...emojis];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    this.memoryCards = deck.map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false
    }));
    this.memoryMoves = 0;
    this.memoryMatches = 0;
    this.isMemoryWon = false;
    this.flippedCardIndices = [];
    this.isCheckingMemoryMatch = false;
  }

  public flipMemoryCard(index: number): void {
    if (this.isCheckingMemoryMatch) return;
    const card = this.memoryCards[index];
    if (card.flipped || card.matched) return;

    card.flipped = true;
    this.audio.playCutePop();
    this.flippedCardIndices.push(index);

    if (this.flippedCardIndices.length === 2) {
      this.memoryMoves++;
      const [idx1, idx2] = this.flippedCardIndices;
      const c1 = this.memoryCards[idx1];
      const c2 = this.memoryCards[idx2];

      if (c1.emoji === c2.emoji) {
        c1.matched = true;
        c2.matched = true;
        this.memoryMatches++;
        this.audio.playMagicSparkle();
        this.launchHeartBurst();
        this.flippedCardIndices = [];

        if (this.memoryMatches === 6) {
          this.isMemoryWon = true;
          this.audio.playCelebrationFanfare();
          this.launchGrandConfettiCelebration();
          this.showToast('🎉 CONGRATULATIONS! You matched all pairs! But the greatest match is US! 💍❤️');
          this.tracker.logAction('game', `Won Love Memory Match Game in ${this.memoryMoves} moves! 🃏🎉`, {
            moves: this.memoryMoves
          });
        }
      } else {
        this.isCheckingMemoryMatch = true;
        setTimeout(() => {
          c1.flipped = false;
          c2.flipped = false;
          this.flippedCardIndices = [];
          this.isCheckingMemoryMatch = false;
        }, 900);
      }
    }
  }

  // ====================================================
  // GAME 16: Celestial Stargazer: Constellation of "US" 🌌✨
  // ====================================================
  public readonly constellationStars = [
    {
      id: 1,
      name: 'Star of 24 Feb 2026',
      icon: '✨',
      subtitle: 'The Sacred Meeting Alignment',
      prophecy: 'The celestial coordinates where two wandering souls locked orbits. The universe whispered: "This is where your search ends and eternity begins."',
      x: 18,
      y: 28
    },
    {
      id: 2,
      name: 'Star of The Safe Haven',
      icon: '🛡️',
      subtitle: 'Sanctuary of Peace',
      prophecy: 'In my arms, you will never have to face the world alone. Here, you are free to cry, laugh, be messy, and be loved unconditionally.',
      x: 42,
      y: 18
    },
    {
      id: 3,
      name: 'Star of Arrival Gates',
      icon: '✈️',
      subtitle: 'The Airport Reunion Vow',
      prophecy: 'The golden star that guides all flights home. The promise of dropping every bag and hugging at the arrivals gate until all distance melts away.',
      x: 75,
      y: 25
    },
    {
      id: 4,
      name: 'Star of Forehead Kisses',
      icon: '💋',
      subtitle: 'The Healer of Worries',
      prophecy: 'One million gentle kisses to take away every tired thought, every tear, and every worry from your forehead and cheeks.',
      x: 28,
      y: 72
    },
    {
      id: 5,
      name: 'Star of Cozy Sundays',
      icon: '🏡',
      subtitle: 'Barefoot Kitchen Dances',
      prophecy: 'A future filled with warm blankets, Sunday morning tea, silly kitchen dance battles, and falling asleep without any phone screen between us.',
      x: 62,
      y: 68
    },
    {
      id: 6,
      name: 'Star of Infinite Eternity',
      icon: '💍',
      subtitle: 'Beyond All Lifetimes',
      prophecy: 'Beyond this life, across every dimension and in every parallel universe, my soul will always search for you and choose only you.',
      x: 85,
      y: 80
    }
  ];
  public selectedConstellationStar: any = this.constellationStars[0];

  public selectConstellationStar(star: any): void {
    this.selectedConstellationStar = star;
    this.audio.playHarpChime();
    this.launchHeartBurst();
    this.tracker.logAction('game', `Gazed at Constellation Star: "${star.name}" 🌌✨`, {
      star: star.name,
      prophecy: star.prophecy
    });
  }

  // ====================================================
  // GAME 17: Love Time Capsules (Future Milestone Envelopes) ⏳✉️
  // ====================================================
  public futureTimeCapsules = [
    {
      id: 1,
      title: 'Our Next Airport Arrivals Gate Hug',
      badge: 'Reunion Day',
      emoji: '✈️',
      vow: 'The exact moment I see you walking out through arrivals, time will freeze. I will drop everything, run towards you, spin you around, and hold you so tight you will feel every beat of my heart saying "You are home now."',
      unlocked: false
    },
    {
      id: 2,
      title: 'Our 1st Official Anniversary Together',
      badge: '1 Year Mark',
      emoji: '🥂',
      vow: 'We will look back at 24 February 2026, laugh at all the late-night screen calls and countdowns, and toast to the fact that love defeated every single mile of distance. And I will love you even more fiercely than the first day.',
      unlocked: false
    },
    {
      id: 3,
      title: 'The Day We Get Our First House Keys',
      badge: 'Our Little Sanctuary',
      emoji: '🗝️',
      vow: 'Unlocking our very own front door, throwing our coats on the floor, and realizing we never have to say goodbye or hang up a call ever again. Just morning coffee, cozy blankets, and forever by your side.',
      unlocked: false
    },
    {
      id: 4,
      title: 'The Night Before Our Wedding Day',
      badge: 'Sacred Vows',
      emoji: '💍',
      vow: 'Looking out at the quiet moon, feeling butterflies in my chest, knowing that tomorrow morning, I get to make the easiest, sweetest, and most sacred choice of my life: promising forever to my dream girl.',
      unlocked: false
    },
    {
      id: 5,
      title: 'When We Are 80 Years Old on Rocking Chairs',
      badge: 'Golden Sunset',
      emoji: '👵🧓',
      vow: 'Silver hair, warm wrinkled hands held tightly together, watching the sunset on our porch. I will look at you with the exact same awe and starry-eyed adoration as I do right now, and whisper: "We did it, my love. Best decision of my life."',
      unlocked: false
    }
  ];

  public unlockTimeCapsule(capsule: any): void {
    if (!capsule.unlocked) {
      capsule.unlocked = true;
      this.audio.playCelebrationFanfare();
      this.launchHeartBurst();
      this.showToast(`Unlocked Time Capsule: ${capsule.title}! ⏳💌`);
      this.tracker.logAction('game', `Unlocked Future Time Capsule: "${capsule.title}" ⏳✉️`, {
        title: capsule.title,
        badge: capsule.badge
      });
    }
  }

  // ====================================================
  // GAME 18: Love Prescription Bottle (Daily Dose of Dopamine) 💊❤️
  // ====================================================
  public readonly lovePillsList = [
    {
      dose: '100mg Instant Dopamine Capsule 💊',
      message: 'You are officially the smartest, kindest, and most breathtaking woman in the solar system! Your smile has a 100% cure rate for all sadness!',
      sideEffect: 'Side Effect: Involuntary blushing and urge to smile like a goofball! 😊'
    },
    {
      dose: '250mg Infinite Hug Pill 🤗',
      message: 'Distance is only geographic; right now, an invisible beam of warm, tight cuddles is wrapped around your shoulders. You are protected and safe.',
      sideEffect: 'Side Effect: Sudden feeling of cozy warmth and safety! ☕'
    },
    {
      dose: '500mg Queen Supremacy Pill 👑',
      message: 'Girlfriend is legally, medically, and scientifically declared 100% right in all past, present, and future discussions! Boyfriend admits unconditional defeat!',
      sideEffect: 'Side Effect: Victorious smirk and entitlement to unlimited chocolate! 🍫'
    },
    {
      dose: '1000mg Soulmate Destiny Vitamin 💍',
      message: 'On 24 February 2026, two souls locked orbits. No distance, busy schedule, or bad day can ever alter what was written in the cosmos.',
      sideEffect: 'Side Effect: Butterfly flutters in stomach and romantic daydreams! ✨'
    },
    {
      dose: '200mg Forehead Kiss Elixir 💋',
      message: 'Take a deep breath and close your eyes: one gentle, lingering forehead kiss has just been planted on your brow to erase all tiredness.',
      sideEffect: 'Side Effect: Immediate relaxation of furrowed eyebrows! 🕊️'
    },
    {
      dose: '750mg Midnight Snack & Pizza Protocol 🍕',
      message: 'Boyfriend authorizes immediate snacking! Zero calorie guilt allowed. Eating favorite sweet treats is strictly mandated by love doctors!',
      sideEffect: 'Side Effect: Sweet tooth cravings satisfied with joy! 🍨'
    }
  ];
  public currentPoppedPill = this.lovePillsList[0];
  public isPoppingPill = false;

  public popLovePill(): void {
    if (this.isPoppingPill) return;
    this.isPoppingPill = true;
    this.audio.playCutePop();

    setTimeout(() => {
      let next = this.currentPoppedPill;
      while (next === this.currentPoppedPill && this.lovePillsList.length > 1) {
        next = this.lovePillsList[Math.floor(Math.random() * this.lovePillsList.length)];
      }
      this.currentPoppedPill = next;
      this.isPoppingPill = false;
      this.audio.playMagicSparkle();
      this.launchHeartBurst();
      this.tracker.logAction('game', `Popped Love Pill: "${this.currentPoppedPill.dose}" 💊❤️`, {
        dose: this.currentPoppedPill.dose,
        message: this.currentPoppedPill.message
      });
    }, 400);
  }

  // --- Cursor Sparkle Trail ---
  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    this.createSparkle(e.clientX, e.clientY);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: TouchEvent): void {
    if (e.touches.length > 0) {
      this.createSparkle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  private createSparkle(x: number, y: number): void {
    if (Math.random() > 0.4) return;
    const colors = ['#f43f5e', '#fda4af', '#fde047', '#e879f9', '#ffffff'];
    const p: SparkleParticle = {
      id: ++this.sparkleCounter,
      x: x + (Math.random() * 16 - 8),
      y: y + (Math.random() * 16 - 8),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.floor(Math.random() * 7 + 4)
    };
    this.sparkles.push(p);

    setTimeout(() => {
      this.sparkles = this.sparkles.filter(s => s.id !== p.id);
    }, 700);
  }

  // --- Time Elapsed Calculation ---
  private updateTimeTogether(): void {
    const met = new Date(this.story.config.metDate).getTime();
    const now = new Date().getTime();
    let diff = Math.max(0, now - met);

    const msPerDay = 1000 * 60 * 60 * 24;
    const msPerHour = 1000 * 60 * 60;
    const msPerMin = 1000 * 60;

    const days = Math.floor(diff / msPerDay);
    diff %= msPerDay;

    const hours = Math.floor(diff / msPerHour);
    diff %= msPerHour;

    const minutes = Math.floor(diff / msPerMin);
    diff %= msPerMin;

    const seconds = Math.floor(diff / 1000);

    this.timeTogether = { days, hours, minutes, seconds };
  }

  // --- Letter Interaction ---
  public toggleLetter(): void {
    this.isLetterOpen = !this.isLetterOpen;
    if (this.isLetterOpen) {
      this.audio.playHarpChime();
      this.launchHeartBurst();
    }
  }

  // --- Sweet Notes Jar Interaction ---
  public drawSweetNote(): void {
    if (this.isDrawingNote) return;
    this.isDrawingNote = true;
    this.audio.playTone(880, 0.25, 'sine', 0.1);

    setTimeout(() => {
      const jar = this.story.sweetNotesJar;
      let nextNote = this.currentSweetNote;
      while (nextNote === this.currentSweetNote && jar.length > 1) {
        nextNote = jar[Math.floor(Math.random() * jar.length)];
      }
      this.currentSweetNote = nextNote;
      this.isDrawingNote = false;
      this.audio.playHarpChime();
      this.tracker.logAction('letter', `Drew Sweet Note: "${this.currentSweetNote}" 🍯`);
    }, 350);
  }

  // --- Milestone Modal ---
  public openMilestone(m: Milestone): void {
    this.selectedMilestone = m;
    this.audio.playTone(660, 0.2, 'triangle', 0.08);
    this.tracker.logAction('letter', `Viewed Milestone: "${m.title}" (${m.date}) 🌟`);
  }

  public closeMilestone(): void {
    this.selectedMilestone = null;
  }

  // --- Reasons Interaction ---
  public toggleReason(id: number): void {
    this.activeReasonId = this.activeReasonId === id ? null : id;
    this.audio.playTone(740, 0.2, 'triangle', 0.08);
  }

  // Image error fallback
  public onImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23be123c%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%233b0764%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-size%3D%2248%22%20fill%3D%22%23fda4af%22%3E%E2%9D%A4%EF%B8%8F%3C%2Ftext%3E%3C%2Fsvg%3E';
  }

  // --- Scroll to Proposal Section ---
  public scrollToProposal(): void {
    this.closeMobileMenu();
    this.scrollToSection('proposal');
    this.audio.playHeartbeat();
  }

  // --- Playful Runaway NO Button Logic ---
  public onNoHover(e: MouseEvent | TouchEvent): void {
    if (e.cancelable) e.preventDefault();
    this.escapeNoButton();
  }

  public onNoClick(e: MouseEvent): void {
    if (e.cancelable) e.preventDefault();
    this.escapeNoButton();
  }

  private escapeNoButton(): void {
    this.audio.playDodgeSound();
    this.noEscapeCount++;

    // Increment YES button size so it becomes massive and inviting
    this.yesScale = Math.min(2.5, this.yesScale + 0.16);

    // Pick runaway message
    const msgIndex = Math.min(this.noEscapeCount, this.runawayResponses.length - 1);
    this.currentNoText = this.runawayResponses[msgIndex];

    this.tracker.logAction('proposal', `Evaded 'No' Button (Attempt #${this.noEscapeCount}) 🙈`, {
      attemptNumber: this.noEscapeCount,
      runawayMessage: this.currentNoText,
      yesButtonScale: Number(this.yesScale.toFixed(2))
    });

    // Compute random bounded viewport coordinates tailored for mobile screens (Samsung One UI)
    const btnWidth = 130;
    const btnHeight = 54;
    const padding = 16;

    const viewportW = Math.max(window.innerWidth || 360, 320);
    const viewportH = Math.max(window.innerHeight || 640, 480);

    // Reserve safe headroom for top nav/notch (90px) and bottom navigation/gesture pill (80px)
    const topSafe = 90;
    const bottomSafe = 80;

    const maxX = Math.max(padding, viewportW - btnWidth - padding);
    const maxY = Math.max(topSafe + 20, viewportH - btnHeight - bottomSafe);

    const randomX = Math.floor(Math.random() * Math.max(10, maxX - padding) + padding);
    const randomY = Math.floor(Math.random() * Math.max(10, maxY - topSafe) + topSafe);

    this.noBtnStyle = {
      position: 'fixed',
      left: `${randomX}px`,
      top: `${randomY}px`,
      zIndex: '9999',
      transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
      touchAction: 'none'
    };
  }

  // --- Say YES! The Big Moment ---
  public onSayYes(): void {
    this.proposalAnswered = true;
    this.acceptedDate = new Date();
    this.audio.playCelebrationFanfare();

    this.tracker.logAction('proposal', 'Accepted Proposal! Said YES! 💍❤️', {
      finalYesScale: Number(this.yesScale.toFixed(2)),
      noAttemptsCount: this.noEscapeCount,
      acceptedDate: this.acceptedDate.toISOString()
    });

    // Trigger full multi-angle confetti explosion
    this.launchGrandConfettiCelebration();
  }

  private launchGrandConfettiCelebration(): void {
    const end = Date.now() + 5000;
    const colors = ['#f43f5e', '#fda4af', '#fde047', '#a855f7', '#fb7185', '#ffffff'];

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Center heart burst
    setTimeout(() => {
      this.launchHeartBurst();
    }, 400);

    setTimeout(() => {
      this.launchHeartBurst();
    }, 1600);
  }

  public launchHeartBurst(): void {
    confetti({
      particleCount: 45,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fda4af', '#fb7185', '#ffffff']
    });
  }

  // --- Audio Upload ---
  public onCustomAudioSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.audio.setCustomAudio(file);
      this.showToast('Your custom love song has been loaded! 🎵');
      this.tracker.logAction('input', `Uploaded Custom Song: ${file.name} 🎵`, {
        fileName: file.name,
        fileSize: file.size
      });
    }
  }

  // --- Customizer Modal Actions ---
  public openCustomizer(): void {
    this.closeMobileMenu();
    this.showCustomizer = true;
  }

  public saveAndCloseCustomizer(): void {
    this.story.saveConfig();
    this.showCustomizer = false;
    this.showToast('Story details saved successfully! ❤️');
    this.tracker.logAction('input', 'Saved Story Personalization Entries ✏️', {
      girlfriendName: this.story.config.girlfriendName,
      boyfriendName: this.story.config.boyfriendName,
      metDate: this.story.config.metDate,
      proposalQuestion: this.story.config.proposalQuestion,
      loveLetterGreeting: this.story.config.loveLetterGreeting
    });
  }

  public resetCustomizer(): void {
    if (confirm('Reset to default romantic template?')) {
      this.story.resetConfig();
      this.showToast('Reset to original template.');
      this.tracker.logAction('input', 'Reset Story Configuration to Defaults');
    }
  }

  public async copyShareLink(): Promise<void> {
    const url = this.story.generateShareableUrl();
    this.tracker.logAction('input', 'Copied Personalized Share Link 💌', { shareUrl: url });
    const copied = await this.tracker.copyToClipboard(url);
    if (copied) {
      this.showToast('Personalized link copied! Send it to her! 💌');
    } else {
      prompt('Copy your special link to send:', url);
    }
  }

  public get certDate(): Date {
    return this.acceptedDate || new Date();
  }

  public printOrSaveCertificate(): void {
    if (!this.acceptedDate) {
      this.acceptedDate = new Date();
    }
    this.tracker.logAction('proposal', 'Opened Certificate Print / Save Dialog 🖨️');
    setTimeout(() => {
      window.print();
    }, 120);
  }

  // --- Reusable High-Resolution Canvas Generator for Certificate ---
  private generateCertificateCanvas(): HTMLCanvasElement {
    const gfName = this.story.config.girlfriendName || 'My Love';
    const bfName = this.story.config.boyfriendName || 'Yours Forever';
    const dateObj = this.acceptedDate || new Date();
    const dateStr = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 980;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background Warm Parchment
    const bgGrad = ctx.createLinearGradient(0, 0, 1400, 980);
    bgGrad.addColorStop(0, '#fdfbf7');
    bgGrad.addColorStop(0.5, '#fffaf3');
    bgGrad.addColorStop(1, '#fbf3e6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1400, 980);

    // Outer Gold Double Border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 7;
    ctx.strokeRect(36, 36, 1328, 908);

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(50, 50, 1300, 880);

    // Inner Dashed Rose Border
    ctx.setLineDash([10, 7]);
    ctx.strokeStyle = 'rgba(190, 18, 60, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(64, 64, 1272, 852);
    ctx.setLineDash([]);

    // Corner Flourishes
    ctx.font = '32px serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText('❦', 80, 105);
    ctx.fillText('❧', 1290, 105);
    ctx.fillText('❧', 80, 895);
    ctx.fillText('❦', 1290, 895);

    // Top Icon
    ctx.font = '58px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📜', 700, 145);

    // Gold Ribbon Badge
    ctx.font = 'bold 17px sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText('⭐ OFFICIAL SOULMATE PLEDGE ⭐', 700, 190);

    // Title
    ctx.font = 'bold 50px Georgia, serif';
    ctx.fillStyle = '#881337';
    ctx.fillText('Certificate of Eternal Love', 700, 255);

    // Subtitle
    ctx.font = 'italic 23px Georgia, serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText(`This confirms that on this magical day of ${dateStr},`, 700, 320);

    // Couple Names
    ctx.font = 'bold 56px Georgia, cursive';
    ctx.fillStyle = '#be123c';
    ctx.fillText(`${gfName}   &   ${bfName}`, 700, 410);

    // Body Text
    ctx.font = '23px Georgia, serif';
    ctx.fillStyle = '#370617';
    ctx.fillText('have joyfully agreed to embark on a lifetime filled with unconditional love,', 700, 490);
    ctx.fillText('endless adventures, sweet laughter, warm cuddles, and unwavering companionship.', 700, 538);
    ctx.fillText('From our sacred first meeting on 24 February 2026 to eternity and beyond.', 700, 586);

    // Divider
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(300, 640);
    ctx.lineTo(1100, 640);
    ctx.stroke();

    // Signatures
    // Girlfriend
    ctx.font = 'italic bold 40px Georgia, cursive';
    ctx.fillStyle = '#881337';
    ctx.fillText(gfName, 380, 730);

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(240, 748);
    ctx.lineTo(520, 748);
    ctx.stroke();

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('THE LOVE OF MY LIFE', 380, 778);

    // Seal
    ctx.beginPath();
    ctx.arc(700, 735, 50, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.font = '34px sans-serif';
    ctx.fillText('💍', 700, 740);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#be123c';
    ctx.fillText('SEALED WITH LOVE', 700, 770);

    // Boyfriend
    ctx.font = 'italic bold 40px Georgia, cursive';
    ctx.fillStyle = '#881337';
    ctx.fillText(bfName, 1020, 730);

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(880, 748);
    ctx.lineTo(1160, 748);
    ctx.stroke();

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('YOURS FOREVER', 1020, 778);

    // Footer Quote
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = '#9f1239';
    ctx.fillText('“Two souls with but a single thought, two hearts that beat as one.”', 700, 860);

    return canvas;
  }

  // --- Direct PDF Document Download (.pdf) ---
  public downloadCertificatePdf(): void {
    try {
      const gfName = this.story.config.girlfriendName || 'My Love';
      const canvas = this.generateCertificateCanvas();
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Create landscape A4 PDF: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Canvas aspect ratio: 1400 / 980 = 1.4285
      // Fit to 190mm height -> 190 * 1.4285 = 271.4mm width
      const pdfW = 271.4;
      const pdfH = 190;
      const posX = (297 - pdfW) / 2;
      const posY = (210 - pdfH) / 2;

      pdf.addImage(imgData, 'JPEG', posX, posY, pdfW, pdfH);
      pdf.save(`Love-Certificate-${gfName.replace(/\s+/g, '_')}.pdf`);

      this.audio.playCelebrationFanfare();
      this.launchHeartBurst();
      this.showToast('Official PDF Certificate downloaded! 📄💍');
      this.tracker.logAction('proposal', 'Downloaded Certificate PDF 📄💍', {
        girlfriendName: gfName,
        anniversaryDate: this.story.config.metDate
      });
    } catch (err) {
      console.warn('PDF export fallback:', err);
      window.print();
    }
  }

  // --- High-Resolution Image Download (.png) ---
  public downloadCertificateImage(): void {
    const gfName = this.story.config.girlfriendName || 'My Love';
    const canvas = this.generateCertificateCanvas();

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Love-Certificate-${gfName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      this.audio.playCelebrationFanfare();
      this.launchHeartBurst();
      this.showToast('Certificate image saved to your photos / downloads! 🖼️❤️');
      this.tracker.logAction('proposal', 'Downloaded Certificate PNG Image 🖼️❤️', {
        girlfriendName: gfName
      });
    } catch (e) {
      this.showToast('Certificate generated! 📜❤️');
    }
  }

  // --- Copy Certificate Text Pledge ---
  public copyCertificateText(): void {
    const gfName = this.story.config.girlfriendName || 'My Dearest';
    const bfName = this.story.config.boyfriendName || 'Yours Forever';
    const dateObj = this.acceptedDate || new Date();
    const dateStr = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const text = `📜 CERTIFICATE OF ETERNAL LOVE 📜\n\n` +
      `This confirms that on this magical day of ${dateStr},\n` +
      `💍 ${gfName} & ${bfName} 💍\n` +
      `have joyfully agreed to embark on a lifetime filled with unconditional love, endless laughter, warm cuddles, and unwavering companionship.\n\n` +
      `"From our sacred meeting on 24 February 2026 to eternity and beyond."\n\n` +
      `Signed:\n` +
      `👰 ${gfName} — The Love of My Life\n` +
      `🤵 ${bfName} — Yours Forever\n\n` +
      `SEALED WITH LOVE ❤️💍`;

    this.tracker.copyToClipboard(text).then((ok) => {
      if (ok) {
        this.showToast('Official Love Pledge copied to clipboard! 📜💖');
        this.tracker.logAction('proposal', 'Copied Certificate Pledge Text 📜');
      } else {
        this.showToast('Official Love Pledge ready! 📜💖');
      }
    });
  }

  // --- Activity Tracker Export & Management Helpers ---
  public downloadTrackerText(): void {
    this.tracker.downloadTextReport();
    this.showToast('Activity Report downloaded (.txt)! 📄');
  }

  public downloadTrackerJson(): void {
    this.tracker.downloadJsonReport();
    this.showToast('Activity Data downloaded (.json)! 📊');
  }

  public async copyTrackerSummary(): Promise<void> {
    const success = await this.tracker.copyReportText();
    if (success) {
      this.showToast('Activity summary copied to clipboard! 📋');
    } else {
      this.showToast('Activity summary ready!');
    }
  }

  public clearTrackerLogs(): void {
    this.tracker.clearLogs();
  }

  // --- Google Sheets Integration Handlers ---
  public openGoogleSheet(): void {
    window.open(this.tracker.googleSheetUrl, '_blank');
    this.showToast('Opening Google Sheet... 📊✨');
  }

  public async copyForGoogleSheets(): Promise<void> {
    const success = await this.tracker.copySheetsTabularData();
    if (success) {
      this.showToast('Copied for Google Sheets! Open your sheet & press Ctrl+V in cell A1 📊📋');
    } else {
      this.showToast('Please use Download CSV or view Raw Table below! 📥');
    }
  }

  public async copyAndOpenSheet(): Promise<void> {
    const success = await this.tracker.copySheetsTabularData();
    window.open(this.tracker.googleSheetUrl, '_blank');
    if (success) {
      this.showToast('Rows Copied! 📋 Sheet opened — just press Ctrl+V in cell A1! ✨');
    } else {
      this.showToast('Google Sheet opened! 📊');
    }
  }

  public downloadTrackerCsv(): void {
    this.tracker.downloadCsvReport();
    this.showToast('Google Sheets CSV downloaded! File > Import in your Sheet 📊📥');
  }

  public toggleWebhookSetup(): void {
    this.showWebhookSetup = !this.showWebhookSetup;
    if (this.showWebhookSetup) {
      this.webhookInputUrl = this.tracker.webhookUrl;
    }
  }

  public toggleRawTabularBox(): void {
    this.showRawTabularBox = !this.showRawTabularBox;
  }

  public saveWebhookUrl(): void {
    const url = (this.webhookInputUrl || '').trim();
    if (this.tracker.isSpreadsheetDocUrl(url)) {
      this.showToast('⚠️ That is the Sheet view link, not Web App URL! Follow the 30-sec Apps Script guide below.');
      return;
    }
    this.tracker.setWebhookUrl(url);
    if (url) {
      this.showToast('Google Sheet Webhook saved! Actions will auto-sync live! ⚡🟢');
    } else {
      this.showToast('Webhook removed.');
    }
  }

  public async syncAllToGoogleSheet(): Promise<void> {
    if (!this.tracker.webhookUrl) {
      this.showToast('Please set your Google Apps Script Webhook URL first! ⚙️');
      return;
    }
    try {
      this.isSyncingToSheet = true;
      const res = await this.tracker.syncAllToGoogleSheetWebhook();
      this.isSyncingToSheet = false;
      this.showToast(`Successfully synced ${res.count} actions to Google Sheet! 📊✅`);
    } catch (err: any) {
      this.isSyncingToSheet = false;
      this.showToast('Sync notice: ' + (err?.message || 'Check Apps Script deployment'));
    }
  }

  public async copyAppsScriptCode(): Promise<void> {
    const code = `// 📊 LOVE STORY TRACKER GOOGLE APPS SCRIPT
// Setup in 30 seconds:
// 1. Google Sheet me jayein: Extensions > Apps Script
// 2. Existing code delete karke yeh code paste karein aur Save karein
// 3. Deploy > New deployment > Select 'Web app'
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Click 'Deploy' aur generated Web app URL copy karke Love Tracker me daal dein!

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return recordEntry(e.parameter);
  }
  return ContentService.createTextOutput("Love Story Tracker Webhook is Active & Ready! ❤️").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var data = {};
  try {
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
  } catch (err) {
    data = {};
  }
  return recordEntry(data);
}

function recordEntry(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Date", "Time", "Category", "Action", "Details", "Timestamp"]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#ffe4e6");
  }
  var now = new Date();
  sheet.appendRow([
    data.id || now.getTime(),
    data.dateFormatted || Utilities.formatDate(now, Session.getScriptTimeZone(), "MMM d, yyyy"),
    data.timeFormatted || Utilities.formatDate(now, Session.getScriptTimeZone(), "hh:mm:ss a"),
    (data.category || "VISIT").toString().toUpperCase(),
    data.action || "User Action",
    typeof data.details === 'object' ? JSON.stringify(data.details) : (data.details || ""),
    data.timestamp || now.toISOString()
  ]);
  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}`;

    const ok = await this.tracker.copyToClipboard(code);
    if (ok) {
      this.showToast('Google Apps Script code copied to clipboard! 📋⚡');
    } else {
      this.showToast('Code ready to copy!');
    }
  }

  private toastTimer: any = null;

  public showToast(msg: string): void {
    this.shareToastMsg = msg;
    this.showShareToast = true;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.showShareToast = false;
    }, 4000);
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.showInstallModal) {
      this.closeInstallModal();
    } else if (this.showTrackerModal) {
      this.closeTracker();
    } else if (this.showCustomizer) {
      this.showCustomizer = false;
    } else if (this.selectedMilestone) {
      this.closeMilestone();
    } else if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}
