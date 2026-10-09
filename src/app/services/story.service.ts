import { Injectable } from '@angular/core';

export interface Milestone {
  id: number;
  date: string;
  title: string;
  tagline: string;
  description: string;
  emoji: string;
  image?: string;
}

export interface LoveReason {
  id: number;
  icon: string;
  title: string;
  shortDesc: string;
  expandedNote: string;
}

export interface LoveLetter {
  id: string;
  badge: string;
  tag: string;
  title: string;
  greeting: string;
  paragraphs: string[];
  signoff: string;
}

export interface Shayari {
  id: number;
  lines: string[];
  translation: string;
  category: 'romantic' | 'soulful' | 'promise' | 'sweet' | 'distance';
  emoji: string;
}

export interface LoveCoupon {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  code: string;
  terms: string;
  isRedeemed: boolean;
}

export interface StoryConfig {
  girlfriendName: string;
  boyfriendName: string;
  metDate: string; // YYYY-MM-DD
  proposalQuestion: string;
  proposalSubtitle: string;
  proposalType: 'girlfriend' | 'marry' | 'forever';
  loveLetterGreeting: string;
  loveLetterBody: string;
  loveLetterSignoff: string;
  photoUrlHero?: string;
  musicTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly STORAGE_KEY = 'love_proposal_config_v3';

  private defaultConfig: StoryConfig = {
    girlfriendName: 'My Dearest',
    boyfriendName: 'With All My Heart',
    metDate: '2026-02-24',
    proposalQuestion: 'Will you be my girlfriend and close every distance between us forever?',
    proposalSubtitle: 'No matter how many miles lie between our cities, my heart has never been closer to anyone than it is to you.',
    proposalType: 'girlfriend',
    loveLetterGreeting: 'To My Beautiful Girl Across The Miles,',
    loveLetterBody: `From the unforgettable day we met on 24 February 2026, my entire world found its compass. Even with distance separating our daily steps, not a single second passes where your warmth and smile aren't living vividly in my thoughts.\n\nI love how you make miles feel like mere inches whenever we laugh on video calls. I love your patience, your trust, and the tender way your voice brings calm to my busiest days.\n\nLoving you across the distance has taught me what true devotion means. You are worth every mile, every countdown, and every wait. Distance is only temporary, but what I feel for you is permanent and eternal.`,
    loveLetterSignoff: 'Closing the distance with every heartbeat,',
    photoUrlHero: '',
    musicTitle: 'Enchanted Starlight (Romantic Harp & Piano)'
  };

  public config: StoryConfig = { ...this.defaultConfig };

  // Collection of Multi-Themed Love Letters
  public loveLetters: LoveLetter[] = [
    {
      id: 'proposal',
      badge: '💍 Read Me First',
      tag: 'The Proposal Letter',
      title: 'The Question of a Lifetime',
      greeting: 'To The Girl Who Holds My Entire Heart,',
      paragraphs: [
        'Before you, love was just a word written in old poems and love songs that never quite felt real to me. But the moment you entered my life, every single cliché turned into undeniable truth. You didn\'t just step into my world; you gently illuminated every quiet, lonely corner of it.',
        'With you, I have found a best friend, an unwavering companion, and a love that feels both exhilarating like lightning and peaceful like home. I love how you look at the world with so much compassion, and I love how your hand feels tucked into mine.',
        'I don\'t just want you for today, or for tomorrow, or for the easy sunny days. I want to stand beside you in the rain, celebrate your greatest milestones, wipe your tears when things get tough, and spend the rest of my days proving how much you mean to me.',
        'You are the only person I want to wake up next to, make breakfast with, and dance around the living room with at midnight. My heart made its choice a long time ago—it chose you.'
      ],
      signoff: 'With all my soul, forever and always,'
    },
    {
      id: 'promises',
      badge: '💖 My Vows',
      tag: 'A Thousand Promises',
      title: 'What I Promise You For All Our Tomorrows',
      greeting: 'My Sweet Angel,',
      paragraphs: [
        'I promise to listen to you, not just when words come easily, but especially when your heart is heavy and feelings are hard to put into words. I will always be your safe haven where you never have to pretend to be anything other than yourself.',
        'I promise to celebrate your victories as if they were my own, and to hold your hand tightly through the storms. When self-doubt tries to creep into your mind, I promise to be the voice that reminds you how brilliant, strong, and wonderfully capable you are.',
        'I promise to never stop courting you. I promise to keep bringing you flowers just because it\'s a Tuesday, to kiss your forehead every morning, to share my food (even the last bite!), and to look at you fifty years from now with the exact same awe I feel today.',
        'No matter what path the universe carves for us, my promise to you will never waver: I will love you, protect you, and cherish you through every chapter of our lives.'
      ],
      signoff: 'Devoted to you eternally,'
    },
    {
      id: 'feb-24-meeting',
      badge: '🌹 24 Feb 2026',
      tag: 'Pehli Mulaqat',
      title: '24 Feb 2026 — The Day My Life Truly Began',
      greeting: 'Meri Jaan,',
      paragraphs: [
        '24 February 2026 — ek aisi taareekh jo mere dil ki deewaron par sunehre lafzon mein hamesha ke liye likhi gayi hai. Wo din jab pehli baar tum meri nazron ke samne aayi, aur laga jaise saari duniya ki raunaq sirf tumhare chehre par aakar thehar gayi ho.',
        'I still remember how fast my heart was racing before meeting you. But the very second our eyes locked and you smiled, all the nervousness melted away into pure magic. That day, I didn\'t just meet a wonderful person; I met my destiny, my peace, and my entire future.',
        'Har saal, har maheena, aur har din jab 24 tareekh aati hai, mera dil usi pehli mulaqat ki khushboo se mehak uthta hai. It was the beginning of the most sacred story of my life.',
        'Thank you for coming into my life on 24 February 2026 and turning my ordinary world into an eternal fairy tale. I will cherish that day and love you until my very last breath.'
      ],
      signoff: 'Hamesha sirf tumhara, har saans ke saath,'
    },
    {
      id: 'distance-love',
      badge: '✈️ Across The Miles',
      tag: 'Long Distance Devotion',
      title: 'Distance Means Nothing When You Mean Everything',
      greeting: 'To My Beloved Girl Across The Miles,',
      paragraphs: [
        'They say distance is to love what wind is to fire; it extinguishes the small, but inflames the great. Every kilometer separating our cities has only made my love for you burn a thousand times brighter.',
        'I miss our video calls where we leave the phone on all night just to hear each other breathe. I miss the silly screenshots I take of you laughing on screen. Even though my arms can\'t physically hold you right now, my soul wraps around you every single second of every single day.',
        'Distance is merely a temporary geographic test to prove that two hearts cannot be kept apart. The thought of finally seeing your face, running into your arms, and never wanting to let go is what keeps me going through every busy day.',
        'You are worth every second of waiting, every ticket booked, and every lonely night. There is no distance in this universe that could ever lessen the love I feel for you.'
      ],
      signoff: 'Closing the distance with every heartbeat,'
    },
    {
      id: 'next-reunion',
      badge: '🫂 The Next Hug',
      tag: 'Countdown To Us',
      title: 'Until I Can Hold You in My Arms Again',
      greeting: 'My Sweetest Love,',
      paragraphs: [
        'I often find myself closing my eyes and imagining the exact second we reunite. Stepping off the journey, scanning the crowd, and finally seeing your face light up with that smile I adore more than life itself.',
        'I know it gets hard sometimes when you want a hug and can only receive a text. But remember, every passing day is one day closer to the day distance will finally lose, and we will win.',
        'Until that moment comes, please hold this thought close to your heart: no matter how far apart we are physically, we look up at the exact same moon and breathe under the exact same sky. You are never alone—I am always with you.'
      ],
      signoff: 'Forever counting down to your embrace,'
    },
    {
      id: 'miss-you',
      badge: '🌙 Long Nights',
      tag: 'Open When You Miss Me',
      title: 'Underneath The Very Same Stars',
      greeting: 'My Precious One,',
      paragraphs: [
        'If you are reading this on a quiet night when distance keeps our arms apart, I want you to pause for a second, take a deep breath, and look up at the night sky. The very same moon and stars watching over you are shining down on me at this exact moment.',
        'Distance is only physical; it has no power over the invisible thread that connects our hearts. Every beat of my heart whispers your name across the miles. Every time my phone lights up, my first thought is hoping it is a sweet message from you.',
        'Close your eyes and remember the warmth of my embrace, the sound of my laughter, and the way my fingers intertwine with yours. Soon enough, we will be together again, and I won\'t let go for a very long time.'
      ],
      signoff: 'Counting the seconds until I hold you again,'
    },
    {
      id: 'tough-days',
      badge: '🌧️ Safe Haven',
      tag: 'Open When You Have a Tough Day',
      title: 'You Are Stronger Than Any Storm',
      greeting: 'My Beautiful Love,',
      paragraphs: [
        'On days when the weight of the world feels heavy on your shoulders, and exhaustion clouds your smile, please let my words wrap around you like a warm blanket.',
        'You don\'t have to be invincible every day. It is okay to be tired, it is okay to cry, and it is okay to just rest. You carry so much light inside you, and even the brightest stars have nights when they are hidden behind rainclouds.',
        'Nothing you face can dim the radiant goodness of who you are. Come rest your head on my chest; leave the worries to me for tonight. We will face tomorrow together, hand in hand, and everything will be alright.'
      ],
      signoff: 'Your shelter and safe harbor,'
    },
    {
      id: 'future',
      badge: '✨ Our Forever',
      tag: 'Looking Ahead',
      title: 'The Life We Are Building Together',
      greeting: 'My Future & My Destiny,',
      paragraphs: [
        'When I close my eyes and imagine what the future looks like, every single daydream has your smile at the center of it. I see cozy mornings with warm mugs of coffee, road trips where we sing at the top of our lungs, and a home filled with laughter and love.',
        'I want to travel the world with you, discover hidden beaches, walk down foreign cobblestone streets, and find little quiet spots where we can sit together and marvel at how lucky we are to have found each other in this vast universe.',
        'Growing old with you is not something I fear; it is the greatest adventure I could ever pray for. You are my today, my tomorrow, and every future I will ever want.'
      ],
      signoff: 'Yours through every lifetime,'
    },
    {
      id: 'first-touch',
      badge: '🤝 First Touch',
      tag: 'Electric Sparks',
      title: 'The Day My Hand First Found Yours',
      greeting: 'My Sweet Heartbeat,',
      paragraphs: [
        'I still remember the exact moment my fingers first brushed against yours. A sudden rush of warmth traveled straight to my heart, and for a fleeting second, everything else in the universe faded into static.',
        'Your hand was so soft, fitting into mine as if the two were pieces of a puzzle designed by destiny. Even now, whenever we walk down the street and your hand slips into mine, my heart skips the exact same beat.',
        'It is a silent reassurance that no matter how crowded the world gets, we belong together. Holding your hand is my favorite habit, and I never want to let it go.'
      ],
      signoff: 'Forever holding your hand,'
    },
    {
      id: 'best-friend',
      badge: '🌸 Soulmate',
      tag: 'My Safe Harbor',
      title: 'My Best Friend & The Love of My Life',
      greeting: 'To My Favorite Human in the Universe,',
      paragraphs: [
        'The most beautiful part of loving you is that before anything else, you became my very best friend. The person I can be completely goofy with, the one who knows my deepest quirks, and the only one whose laugh can cure my worst mood.',
        'We can sit in comfortable silence for hours, or talk nonsense until 3 AM, and either way it feels like the richest conversation in the world. I don\'t have to wear any masks or pretend around you; you see all of me and love me anyway.',
        'Having you as my partner is a blessing, but having you as my best friend is the greatest gift life could ever give me. Thank you for walking through this journey beside me.'
      ],
      signoff: 'Your partner in crime and forever love,'
    },
    {
      id: 'letter-80',
      badge: '👵🧓 Golden Years',
      tag: 'When We Are Old',
      title: 'A Letter to Our 80-Year-Old Selves',
      greeting: 'To My Gorgeous Girl (Even with Silver Hair),',
      paragraphs: [
        'I am writing this now so that decades from today, when we are sitting on rocking chairs on our porch with cups of tea in our hands, we can look back and smile at where it all began.',
        'Our hair might be white, our skin might carry beautiful wrinkle lines from years of uncontrollable laughter, and our steps might be slower, but I promise you this: I will look at you with the exact same starry-eyed wonder I have right now.',
        'We will look back at every memory, every hug, every adventure, and say: "We did it. We loved each other fiercely, through everything." You are my once-in-a-lifetime, and I would choose you over and over in every universe.'
      ],
      signoff: 'Still head-over-heels in love with you at 80,'
    },
    {
      id: 'morning-letter',
      badge: '☀️ Morning Sun',
      tag: 'Start Your Day',
      title: 'Good Morning, My Purest Sunshine',
      greeting: 'To The Girl Who Greets My Mind Every Dawn,',
      paragraphs: [
        'Every morning when my eyes flutter open, before the reality of the day rushes in, my first gentle thought is always of you. You are the warmth that makes waking up worth looking forward to, the sweetest start to any 24 hours.',
        'I hope today is extraordinarily kind to you. I hope the sun warms your cheeks gently, I hope someone makes you giggle until your stomach hurts, and I hope you feel the invisible arms of my love holding you tight throughout whatever meetings or chores you have.',
        'Never forget that no matter how busy the hours get, someone in this world is endlessly proud of you, cheering for you, and counting down the minutes until he gets to hear your sweet voice again.'
      ],
      signoff: 'Sending you a thousand morning kisses,'
    },
    {
      id: 'rainy-day',
      badge: '☔ Rainy Days',
      tag: 'Cozy Moments',
      title: 'Raindrops, Hot Chocolate & You',
      greeting: 'My Cozy Haven,',
      paragraphs: [
        'Listen to the steady rhythm of the rain tapping on the windowpane. There is something so profoundly peaceful about rainy afternoons, but they always make me miss you just a little bit more.',
        'I find myself daydreaming about us wrapped in a plush blanket, sharing a giant mug of hot chocolate, watching old movies while you rest your head right over my heart. We wouldn\'t even need to say a word—just existing together in that warm, sweet silence would be paradise.',
        'Rainy days are reminders that after every downpour, flowers bloom and the earth renews itself. Just like that, your love washes away all the weariness from my soul and makes everything feel fresh and beautiful again.'
      ],
      signoff: 'Wishing I was holding you under the rain,'
    },
    {
      id: 'you-are-enough',
      badge: '💎 Always Worthy',
      tag: 'When Doubts Whisper',
      title: 'In Case You Ever Forget How Rare You Are',
      greeting: 'To My Incomparable Girl,',
      paragraphs: [
        'If you are opening this letter because the world made you feel small today, or because that harsh inner critic made you doubt yourself, take a deep breath and listen closely to my heart.',
        'You do not need to be flawless to be adored. You do not need to constantly produce, achieve, or please everyone around you to be worthy of love. In my eyes, you are a masterpiece in progress—stunning not in spite of your vulnerabilities, but because of your genuine, tender humanity.',
        'The way your heart loves, the way you try your best, the quiet strength you show when nobody is looking... there is nobody on this entire planet like you. You are more than enough. You always have been, and you always will be.'
      ],
      signoff: 'Loving every single piece of you,'
    },
    {
      id: 'celebrate-you',
      badge: '🎉 Celebrating You',
      tag: 'A Toast to Your Life',
      title: 'The Universe Got Brighter Because of You',
      greeting: 'My Favorite Miracle,',
      paragraphs: [
        'Sometimes I just pause and marvel at the sheer statistical improbability of us. Out of billions of people walking the earth, out of thousands of years of human history, my timeline crossed with yours.',
        'You carry a certain magic that you probably don\'t even notice. Flowers seem brighter when you walk past them, rooms feel lighter when you enter, and hearts heal when you speak kindly. You have blessed every life you have ever touched, but none more deeply than mine.',
        'Today and every day, I celebrate your presence, your laughter, your dreams, and your heart. Thank you for existing, and thank you for allowing me to be the lucky guy who gets to love you.'
      ],
      signoff: 'Forever your biggest admirer,'
    },
    {
      id: 'little-things',
      badge: '☕ The Little Things',
      tag: 'What Nobody Sees',
      title: 'The Hundred Quiet Details I Adore',
      greeting: 'My Darling,',
      paragraphs: [
        'People often talk about love in grand, cinematic terms—dramatic declarations under the pouring rain and expensive gifts. But for me, the deepest love lives in the quiet, mundane moments that belong only to us.',
        'I love the way your eyes light up when your favorite dessert arrives. I love how you sing along to songs even when you don\'t know the exact lyrics. I love the cute little sigh you make when you finally lay your head on the pillow after a tiring day.',
        'I love the funny expressions you make when you\'re thinking hard, and the fierce loyalty you have for the people you care about. These tiny, unscripted moments are where my heart made its home. I fall in love with you all over again a hundred times a day.'
      ],
      signoff: 'Captivated by every little thing you do,'
    },
    {
      id: 'multiverse',
      badge: '🌌 Every Universe',
      tag: 'Written in Stars',
      title: 'I Would Search Galaxies Just to Find You',
      greeting: 'To My Soul\'s Eternal Match,',
      paragraphs: [
        'They say that in quantum physics, there might exist an infinite number of parallel universes, where different choices create different realities. But if that is true, I know one certainty beyond all doubt:',
        'In every single one of those universes, my soul would still gravitate toward yours. Whether we were born centuries in the past or thousands of years into the future, across any continent or under any sky, I would still look across a crowded room and know instantly that you were my destiny.',
        'You are not a coincidence in my life; you are an inevitability. Loving you is written into the fundamental code of my being.'
      ],
      signoff: 'Across all timelines and eternities,'
    },
    {
      id: 'growing-together',
      badge: '🌱 Hand in Hand',
      tag: 'Through Every Bump',
      title: 'Choosing You, Today, Tomorrow & Always',
      greeting: 'My Life Partner,',
      paragraphs: [
        'Real love isn\'t a fairy tale where nothing ever goes wrong. Real love is choosing to listen when things get frustrating, choosing patience when life gets stressful, and choosing to hold hands even tighter when the road gets rocky.',
        'I don\'t just love you on the easy days when the sun is shining and laughter is effortless. I promise to love you on the messy days, the tired days, and the days when neither of us has the answers.',
        'Growing with you is my life\'s greatest joy. Every little challenge we overcome only cements what I have known from the very beginning: you and me, we are an unbreakable team. There is nowhere else I would rather be.'
      ],
      signoff: 'Steadfast and devoted, through everything,'
    },
    {
      id: 'soul-connection',
      badge: '🕊️ Soul Connection',
      tag: 'Do Roohon Ka Milan',
      title: 'Do Roohon Ka Milan — Beyond Time & Space',
      greeting: 'To My Soul\'s Other Half,',
      paragraphs: [
        'Kuch rishte dimaag se nahi, seedhe rooh se bante hain. Jab se tum meri zindagi mein aayi ho, mujhe har pal yeh ehsaas hota hai ki hum pehli baar nahi mile—hamaari roohein pehle bhi kisi jahan mein ek-doosre ko jaanti thi.',
        'I have never felt so completely understood by anyone in my entire existence. You don\'t just hear my words; you understand my silences. You notice when my energy shifts even across a phone call, and you know how to bring warmth to my spirit with just a whisper.',
        'Distance can separate our hands, our cities, and our timezones, but it cannot touch the invisible silver thread connecting our souls. You are woven into every breath I take, and nothing in this cosmos could ever untie that sacred knot.'
      ],
      signoff: 'Rooh se rooh tak, hamesha sirf tera,'
    },
    {
      id: 'midnight-call',
      badge: '🌙 2 AM Whispers',
      tag: 'Across The Screen',
      title: 'When The Whole World Sleeps, We Belong',
      greeting: 'My Late Night Peace,',
      paragraphs: [
        'It is 2 AM, the world outside has turned silent, and all the day\'s noise has faded away. On the other end of the screen, you are tucked under your blankets, speaking in that soft, sleepy voice that makes my heart feel dangerously full.',
        'These late night video calls are my sanctuary. When you get so sleepy that your eyes flutter half-closed, but you still murmur, "Nahi, mujhe neend nahi aa rahi," I just smile like the happiest guy alive. Watching you drift off to sleep while our call stays connected is the closest I can get to lying right beside you.',
        'I whisper a quiet prayer over your sleeping face across the miles: that your dreams are sweet, that you feel loved beyond measure, and that tomorrow brings us one day closer to the night we never have to hang up a call again.'
      ],
      signoff: 'Guarding your sleep with all my love,'
    },
    {
      id: 'when-you-are-mad',
      badge: '🥺 Open When Mad',
      tag: 'Peace & Forgiveness',
      title: 'You Are Still My Favorite Person (Even When Pouting)',
      greeting: 'To My Adorable, Stubborn Queen,',
      paragraphs: [
        'If you are reading this with your arms crossed, your brows furrowed, and a cute little angry pout on your face—first of all, I am so sorry. Whatever clumsy, silly thing I said or did to hurt your feelings or annoy you, I take full responsibility.',
        'You have every right to be mad at me, but please don\'t stay mad for too long, because my world feels completely off-balance whenever you are upset. Even when you are angry, you are the most precious person in the universe to me.',
        'I surrender completely! Girlfriend is 1000% right, boyfriend is guilty, and his punishment is to bring you your favorite dessert, give you endless forehead kisses, and hold you until you finally can\'t help but smile again. Can we please make up now? 🥺❤️'
      ],
      signoff: 'Your clumsy boyfriend who loves you endlessly,'
    },
    {
      id: 'first-anniversary',
      badge: '💎 Our Milestones',
      tag: 'Every Single Second',
      title: 'A Lifetime of 24 Februaries',
      greeting: 'My Eternal Valentine,',
      paragraphs: [
        '24 February 2026 was the spark that ignited an eternal fire in my heart. Every single day that has passed since that magical date has only confirmed what my soul whispered that very first morning: "This is her. This is your home."',
        'We have celebrated small victories, shared secret jokes, wiped each other\'s tears across video calls, and built a sanctuary of trust that nothing in this world can shake. Each milestone with you doesn\'t feel like looking back at days gone by; it feels like stepping deeper into a paradise that belongs only to us.',
        'I want to celebrate fifty more 24 Februaries with you. I want to celebrate when our hair is peppered with silver, when our steps are slow, and when we hold hands on a quiet porch remembering the very first spark that started it all.'
      ],
      signoff: 'Eternally grateful for 24 Feb 2026,'
    },
    {
      id: 'safe-with-me',
      badge: '🛡️ Safe Haven',
      tag: 'Unconditional Shelter',
      title: 'You Will Always Have Me By Your Side',
      greeting: 'My Gentle Angel,',
      paragraphs: [
        'The world can be noisy, harsh, and demanding. Sometimes it asks you to be strong when all you want to do is crumble; sometimes it demands perfection when all your spirit needs is rest.',
        'I want you to always remember that with me, you never have to be strong. You never have to put on a brave face, perform, or pretend. With me, you can just exist—messy hair, quiet thoughts, tears, or silly giggles—and you will be loved with the exact same ferocious devotion.',
        'As long as I have breath in my body, I will stand as your shield against the storm. When you feel lonely, I will be your company. When you feel anxious, my hand will hold yours until your breathing slows down. You are safe with me, always.'
      ],
      signoff: 'Your protector, partner, and safe haven,'
    },
    {
      id: 'our-little-home',
      badge: '🏡 Our Future Home',
      tag: 'The Dreams We Share',
      title: 'Keys, Warm Blankets & Sunday Mornings',
      greeting: 'My Future & My Heart,',
      paragraphs: [
        'Sometimes when the distance feels especially heavy, I close my eyes and take a walk through our future. I see a cozy little apartment or a sweet house with warm fairy lights, a kitchen smelling of cinnamon and morning coffee, and a giant plush couch where we both collapse after work.',
        'I picture Sunday mornings where neither of us has to set an alarm. Rolling over, pulling you into my chest, burying my face in your hair, and whispering "Good morning, my love" without any phone screen between our faces.',
        'We will hang our travel photos on the walls, have silly dance battles while boiling pasta, and welcome each other home with long, warm hugs. That home is not just a dream—it is our destination. And every single day brings us closer to holding that key.'
      ],
      signoff: 'Dreaming of our front door,'
    },
    {
      id: 'sleepy-video-calls',
      badge: '🌙 Midnight Calls',
      tag: 'Falling Asleep Together',
      title: 'Falling Asleep to Your Gentle Breathing',
      greeting: 'Meri Neend, Mera Sukoon,',
      paragraphs: [
        'There is a sacred tranquility at 2:30 AM when the world outside has gone quiet, our screens are propped up against pillows, and your voice slows down into a sleepy whisper.',
        'Watching your eyelids flutter closed and listening to the rhythmic, soft sound of your breathing on call is my favorite lullaby in the entire universe. Even though there are hundreds of miles between our beds, in that silence, it feels like I am gently tucking you in and kissing your forehead.',
        'I never want to end the call first. I just want to stay awake a few minutes longer, marveling at how gentle and pure you are. One day soon, there won\'t be a phone between us; you will be resting your head directly on my chest, and I will kiss your sleepy forehead in real life.'
      ],
      signoff: 'Always watching over your sweetest dreams,'
    },
    {
      id: 'when-you-doubt-yourself',
      badge: '🪞 You Are Rare',
      tag: 'Open When Self-Doubt Creeps In',
      title: 'When You Forget How Incredibly Rare You Are',
      greeting: 'To My Brilliant, Angelic Queen,',
      paragraphs: [
        'If today was one of those days where the world made you feel small, or an inner voice whispered that you are not doing enough—stop right now. Take a deep breath and let my words hold an honest mirror up to your soul.',
        'You have a heart so gentle that it feels like a sanctuary, a mind so bright and intuitive, and a spirit of kindness that touches everyone who is blessed to know you. You don\'t need to prove anything to anyone; your existence itself is a breathtaking masterpiece.',
        'Whenever you forget your worth, lean on my eyes. I see your resilience, your grace, and the pure gold inside your spirit. You are more than enough, my love—you are my entire universe.'
      ],
      signoff: 'Your biggest cheerleader and eternal believer,'
    },
    {
      id: 'our-future-kitchen',
      badge: '🥞 Future Mornings',
      tag: 'Kitchen Dances & Silly Laughter',
      title: 'Dancing Barefoot in Our Future Kitchen',
      greeting: 'To My Favorite Dance Partner For Life,',
      paragraphs: [
        'I have this vivid daydream that plays on repeat whenever I think of us: Sunday morning, soft sunlight pouring across our wooden floor, the radio playing our favorite slow Bollywood acoustic song, and a pan of breakfast sizzling on the stove.',
        'You walk in wearing my oversized t-shirt, messy morning hair, rubbing your sleepy eyes. And instead of saying good morning, I pull you by the waist, spin you around in a silly little barefoot dance, and hear that breathless giggle that makes my heart explode with happiness.',
        'We don\'t need a fancy palace; just that cozy kitchen, our silly burnt toast, flour on our noses, and a lifetime of sharing warm tea and forehead kisses.'
      ],
      signoff: 'Saving every dance for you,'
    },
    {
      id: 'your-hands-in-mine',
      badge: '🤝 Sacred Touch',
      tag: 'Holding Your Hand',
      title: 'The Sacred Weight of Holding Your Hand',
      greeting: 'My Safe Harbor,',
      paragraphs: [
        'People talk about grand gestures, but for me, heaven is as simple as feeling your fingers slip between mine. The warmth, the softness, the way your thumb gently strokes my knuckles when we are sitting together.',
        'In that simple touch lies an unspoken promise: "I am here. You are not alone. Whatever happens, we walk through it together." It is grounding and electrifying at the exact same time.',
        'I will never take holding your hand for granted. It is the anchor of my life, and I promise to hold it tight whether we are walking through flower gardens or through life\'s hardest storms.'
      ],
      signoff: 'Never letting go,'
    },
    {
      id: 'the-quiet-moments',
      badge: '🕊️ Pure Peace',
      tag: 'Comfortable Silence',
      title: 'Loving You in The Ordinary Silence',
      greeting: 'To My Peaceful Sanctuary,',
      paragraphs: [
        'They say love is loud—confetti, fireworks, and passionate speeches. But my favorite part of loving you is the quiet peace that lives between the words.',
        'The moments where we don\'t even have to say anything. We can just sit side-by-side on video call, each reading or working, and the simple awareness that you exist in my world brings an overwhelming wave of calm to my chest.',
        'With you, silence is never awkward; it is cozy, tender, and deeply intimate. You are the quiet corner of the universe where my soul takes off its armor and breathes.'
      ],
      signoff: 'Yours in every quiet and loud heartbeat,'
    }
  ];

  public milestones: Milestone[] = [
    {
      id: 1,
      date: '24 February 2026',
      title: 'Pehli Mulaqat — The Day We Met',
      tagline: 'Jab pehli baar tum meri nazron ke samne aayi aur waqt thehar gaya',
      description: '24 February 2026 — the golden day that changed my life forever. The moment I saw you in person, all the noise of the universe vanished. My heart instantly knew that every search, every prayer, and every dream had led me to you.',
      emoji: '🌹',
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 2,
      date: 'Across The Miles',
      title: 'Late Night Screen Calls & Whispers',
      tagline: 'Falling asleep to the gentle sound of your voice',
      description: 'Miles apart, but sharing the exact same moon. Those endless late-night video calls where we laugh until our ribs ache, share secret dreams, and leave the call on until we fall asleep peacefully listening to each other breathe.',
      emoji: '📱',
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 3,
      date: 'Surprise Deliveries',
      title: 'Sending Love Across City Borders',
      tagline: 'Small parcels carrying giant pieces of my heart',
      description: 'Surprising you with your favorite food and sweet treats, sending flowers to your doorstep on a random Tuesday, and wearing matching hoodies so we feel wrapped in each other\'s warmth.',
      emoji: '📦',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 4,
      date: 'Reunion Countdowns',
      title: 'Train & Airport Butterflies',
      tagline: 'Counting down every second until that arrival hug',
      description: 'Booking travel tickets with pure excitement, checking the calendar every morning, and that breathless rush of adrenaline when running towards you for that tight, long-awaited embrace that makes time stand still.',
      emoji: '✈️',
      image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 5,
      date: 'Our Unbreakable Promise',
      title: 'Distance Is Temporary, We Are Forever',
      tagline: 'Distance proved how strong, pure, and real our love is',
      description: 'They say long distance tests love, but for us, it only proved that nothing on earth can break what we share. One day soon, every mile will disappear, and every single morning will start with you right beside me.',
      emoji: '💍',
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=700&q=80'
    }
  ];

  public loveReasons: LoveReason[] = [
    {
      id: 1,
      icon: '✨',
      title: 'Your Radiant Smile',
      shortDesc: 'A light that turns my gloomiest days into pure sunshine.',
      expandedNote: 'Whenever you smile, the entire atmosphere changes. It is warm, genuine, and so radiant that it instantly melts away all stress and worry.'
    },
    {
      id: 2,
      icon: '🌸',
      title: 'Your Gentle Heart',
      shortDesc: 'The empathy and compassion you show to everyone around you.',
      expandedNote: 'You care so deeply about people, animals, and the world. Your tenderness reminds me of how much pure good exists in life.'
    },
    {
      id: 3,
      icon: '🎶',
      title: 'Your Sweet Laughter',
      shortDesc: 'My absolute favorite sound in the whole universe.',
      expandedNote: 'Hearing you truly giggle or burst into laughter is intoxicating. It makes me want to tell silly jokes forever just to hear it over and over.'
    },
    {
      id: 4,
      icon: '🏡',
      title: 'Peace in Your Presence',
      shortDesc: 'Being with you feels like arriving safely home after a long journey.',
      expandedNote: 'The chaos of life quietens down when I am with you. In your embrace, I feel completely accepted, calm, and deeply understood.'
    },
    {
      id: 5,
      icon: '🌟',
      title: 'How You Inspire Me',
      shortDesc: 'You inspire me to be stronger, kinder, and better every day.',
      expandedNote: 'Watching your passion, your intelligence, and your grace pushes me to grow into the man you truly deserve.'
    },
    {
      id: 6,
      icon: '💫',
      title: 'The Magic in Little Moments',
      shortDesc: 'Sharing silence, silly looks, grocery runs, and handshakes.',
      expandedNote: 'We do not need grand gestures to make memories. Simply sitting beside you doing nothing feels like the greatest privilege.'
    }
  ];

  public sweetNotesJar: string[] = [
    'You are the reason my phone has so many screenshots of your cute texts. ❤️',
    'I fall in love with you a little more every single morning when I wake up.',
    'If I had a star for every time you made me smile, I would hold an entire galaxy in my hands. ✨',
    'You make my heart beat faster and feel peaceful all at the exact same time.',
    'My favorite place in the whole wide world is right next to you, wrapped in your warmth.',
    'I love the little way your eyes crinkle when you laugh really hard.',
    'You are my answered prayer, my sweetest dream, and my favorite reality.',
    'I promise to always share my fries with you (even when you said you weren’t hungry!). 🍟',
    'You are both my best friend and the greatest love of my life.',
    'Thank you for loving me exactly as I am, with all my quirks and flaws.',
    'No love song ever made sense until the day you entered my life. 🎶',
    'I could stare into your eyes for hours and still discover new reasons to love you.',
    'You are my favorite notification, my favorite thought, and my favorite hello.',
    'Whenever I look at you, I see my entire future reflected in your eyes.',
    'I didn’t choose to fall in love with you; my heart simply recognized where it belonged.',
    'Your hand fits in mine like it was uniquely carved just for this.',
    'You make the ordinary moments—grocery runs, quiet car rides, rainy afternoons—feel like pure magic.',
    'I love how safe and understood I feel whenever I am with you.',
    'You are the poetry my soul always wished it knew how to write.',
    'I promise to always kiss your forehead and remind you how extraordinary you are.',
    'Looking at you still gives me the exact same butterflies as our first date.',
    'You are the sweetest surprise the universe ever blessed me with. 🌸',
    'No matter what today throws at us, remember that you are deeply, passionately, and unconditionally loved.',
    'I want to grow old with you, count wrinkles together, and still think you are the most gorgeous girl on earth.',
    'Every love story is beautiful, but ours is my absolute favorite.',
    'You have this effortless way of making my worst days turn into blessings just by smiling.',
    'If loving you was a job, I would be the most dedicated and happiest worker in history.',
    'I love your kindness, your gentle soul, and the way you care for the smallest things.',
    'I don’t need the moon or the stars; having your love is already having the universe.',
    'My heart whispers your name with every single beat it takes. 💓',
    'You are my person, today, tomorrow, and for all the lifetimes to come.',
    'I love our silly inside jokes that make zero sense to anyone else.',
    'Thank you for being my anchor when life gets stormy and my wings when I want to fly.',
    'I promise to choose you, stand by you, and fight for you every day of my life.',
    'You turned my world into a garden where only joy and love bloom. 🌹',
    'Will you let me keep loving you like this forever? 💍',
    'Every song on the radio suddenly reminds me of your smile.',
    'You are my cup of warm coffee on a freezing winter morning.',
    'I love the way you get excited about little things in life.',
    'Holding your hand is the most natural thing in the world.',
    'If I could give you one thing in life, I would give you the ability to see yourself through my eyes.',
    'You make me laugh even on days when I forgot how to smile.',
    'I fell in love with your mind, your heart, and your gentle soul.',
    'You are my home, wherever we are in the world.',
    'I love hearing you talk about things you are passionate about.',
    'My favorite notification is your name lighting up my screen.',
    'I will never get tired of looking into your gorgeous eyes.',
    'You are the best decision my heart ever made.',
    'Loving you is the easiest, sweetest, and most rewarding adventure.',
    'I love when you laugh so hard you have to catch your breath.',
    'Thank you for bringing so much peace into my chaotic world.',
    'You are worth every second of waiting, every mile, and every prayer.',
    'I want every sunset and every sunrise to be shared with you.',
    'I promise to never take a single kiss or warm hug for granted.',
    'You are my today, my tomorrow, and my entire forever. ❤️',
    '24 February 2026 will forever be the day my universe became complete. 🌹',
    'Distance means so little when you mean the entire world to me. ✈️❤️',
    'Falling asleep on video call while listening to your sweet breathing is my favorite lullaby.',
    'No amount of miles can diminish the love that was born on 24 February 2026.',
    'Screen kisses are cute, but nothing will ever beat the real, long-awaited hug waiting for you!',
    'One day soon, all our travel tickets will turn into one shared house key. 🗝️🏡',
    '24 Feb ko pehli baar dekha tha, aur aaj bhi mera dil har lamha sirf tera hi naam leta hai. 💕',
    'Every single second of this wait is worth it, because at the end of every mile is you.',
    'Duniya chahe kitni bhi badi ho, mera sabse sukoon bhara thikana sirf tumhari bahein hain. 🏡❤️',
    'You are the only person who can make me smile like a goofball just by sending a single sticker. 🥺',
    'Even if we are on a 5-hour call, hanging up still feels like tearing away half my heart.',
    'Meri subah tumhari aawaz se shuru ho, aur meri raat tumhari baaton par khatam ho—bas yahi dua hai. 🌅🌙',
    'I love you in your messy bun, oversize tees, morning puffy eyes, and with zero makeup.',
    'Tere pouting chehre par bhi itna pyaar aata hai ki dil chahta hai din bhar tumhe chhedta rahoon! 🙈',
    'In a world full of temporary trends, what we started on 24 Feb 2026 is an eternal classic. 💎',
    'Whenever I listen to romantic songs, you are the only face that replays in my mind on loop. 🎧',
    'Tere haathon ki bani chai aur tere saath lambi baatein—meri zindagi ka sabse bada sapna! ☕❤️',
    'You have no idea how pretty you look when you get passionate and talk about your favorite things.',
    'I don’t just want to be your lover; I want to be your safest secret-keeper and your biggest cheerleader.',
    'Distance is just physical geography; spiritually, I am holding your hand right now. 🤝✨',
    'Tumse baat karke mera sara din ka stress aise gayab hota hai jaise kabhi tha hi nahi. 💆‍♂️💖',
    'I promise to always open doors for you, hold your bags, and pull you in for forehead kisses in public.',
    'Jab tum hasti ho na, lagta hai saari duniya ke dukh ek pal mein fanaa ho gaye. 🌸',
    'You are my permanent favorite thought between all my busy meetings and work hours.',
    'Agar mujhe zameen par jannat dhoondhni ho, toh main bas tumhari aankhon mein dekh loonga. ✨',
    'I will never let you walk through any storm alone. Main hamesha tumhare aage dhaal bankar khada rahoonga.',
    'Every picture of yours in my gallery is a reminder of how ridiculously lucky I got in life. 📸🥰',
    'You are the sweet melody my heart beats to, even in the middle of a crowded room.',
    'Tere bina har shaam adhoori hai, tu saath ho toh har pal ek meethi diwali hai. 🪔✨',
    'I promise to buy you your favorite ice cream whenever you are angry, and apologize first! 🍦🥺',
    'Soulmates aren’t found by chance; the universe connected our orbits on 24 February 2026. 🌌💍',
    'You make me want to be the best version of myself, just so I can give you the world you deserve.',
    'Mera dil tumhare paas girvi hai, aur main ise kabhi waapas maangne ka iraada nahi rakhta! 😉❤️',
    'I love the way your fingers fit into mine like two puzzle pieces designed by destiny.',
    'Distance taught me that true love is not about physical proximity, but soul connectivity. ✈️🕊️',
    'You are my favorite miracle, my favorite human, and my forever home. 💖',
    'Har din rab se bas yahi maangta hoon: tumhari hansi kabhi kam na ho, aur mera saath kabhi chhoote na.',
    'I would choose you in every lifetime, in every parallel world, under every single star. 🌟',
    'Screen par tumhara chehra dekh kar dil ko jo sukoon milta hai, wo kisi aur cheez mein nahi.',
    'You are the answer to every question my restless soul ever asked the universe. 💫',
    'Meri jaan, tum meri zindagi ka wo haseen khwab ho jo haqeeqat ban gaya hai. 🌹💍',
    'I love the little sleepy sigh you let out right before dozing off on our midnight calls. 🌙😴',
    'You are the only person who can completely melt all my bad mood within 3 seconds flat. 🫠✨',
    'Every single second spent loving you is my absolute favorite second of the day. ⏳❤️',
    'I promise to dance with you in the kitchen, hold you during scary movies, and steal kisses at red lights. 🚦💋',
    'My camera roll is basically 90% screenshots of you making silly faces on video calls! 📸🥰',
    'If beauty was quantified in light years, you would be an entire glowing galaxy on your own. 🌌✨',
    'The moment you smile at me, every problem in the world shrinks down to zero. 🌸',
    'You are my permanent emergency contact for love, laughter, and midnight snacking! 🍕🍟',
    'Distance is just a test to see how far love can travel. Spoiler alert: ours crossed galaxies! 🚀💫',
    'Tere pouting chehre par main apni saari duniya haar sakta hoon. 🥺❤️',
    'Whenever I hug you in my imagination, my heart actually beats a little faster. 💓',
    'You are the best decision, the sweetest chapter, and the happiest blessing of my entire life. 💍',
    'I don’t need 100 people around me; just one video call notification with your name is enough! 📱💖',
    'From our 24 Feb 2026 spark to 100 years from now, I am yours unconditionally. 🌹🕊️'
  ];

  public shayaris: Shayari[] = [
    {
      id: 1,
      lines: [
        'Tere chehre ki chamak se meri subah hoti hai,',
        'Teri muskaan se hi meri har khushi mukammal hoti hai.',
        'Tu jo paas ho to jahan ki fikar nahi rehti,',
        'Meri har saans teri hi mohabbat mein dhalti hai.'
      ],
      translation: 'My morning begins with the glow of your face, and all my happiness is completed by your smile. When you are by my side, the worries of the world vanish; every breath of mine is shaped by your love.',
      category: 'romantic',
      emoji: '🌹'
    },
    {
      id: 2,
      lines: [
        'Khuda ne jab tumhe banaya hoga,',
        'Ek noor sa aasmaan se zameen par utara hoga.',
        'Duaon mein jise manga tha barson se,',
        'Wo khoobsurat naseeb mujhe rab ne baksha hoga.'
      ],
      translation: 'When God created you, He must have sent down a piece of heavenly light to earth. The prayer I whispered for years was granted when destiny brought you into my arms.',
      category: 'soulful',
      emoji: '✨'
    },
    {
      id: 3,
      lines: [
        'Ishq wo nahi jo lafzon mein bayaan kiya jaaye,',
        'Ishq wo hai jo bina bole har saans mein mehsoos kiya jaaye.',
        'Meri har khwahish ka aakhri mukaam ho tum,',
        'Meri subah ka pehla aur raat ka aakhri naam ho tum.'
      ],
      translation: 'True love is not merely what can be captured in words; it is what is felt silently in every breath. You are the final destination of all my wishes, the first thought of my morning, and the last name on my lips at night.',
      category: 'soulful',
      emoji: '🌙'
    },
    {
      id: 4,
      lines: [
        'Tumhe dekhta hoon to lagta hai zamaana tham gaya,',
        'Tere bina jeene ka har ek fasaana tham gaya.',
        'Tu meri zindagi ki wo sabse khoobsurat aayat hai,',
        'Jise padh kar mere is bechain dil ko sukoon mil gaya.'
      ],
      translation: 'Whenever I look at you, it feels as though time itself pauses. You are the most sacred and beautiful verse in my book of life, reading which my restless soul found eternal peace.',
      category: 'romantic',
      emoji: '💖'
    },
    {
      id: 5,
      lines: [
        'Chhoo kar tere haathon ko ek ajeeb sa sukoon milta hai,',
        'Jahan do jism nahi, do roohon ka junoon milta hai.',
        'Haath thama hai to ab aakhri saans tak na chhodenge,',
        'Tere bina meri har khushi ka rang feeka padta hai.'
      ],
      translation: 'Holding your hand brings a divine tranquility where two souls connect completely. Having held your hand, I will never let go until my last breath; without you, all the colors of joy fade away.',
      category: 'promise',
      emoji: '🤝'
    },
    {
      id: 6,
      lines: [
        'Teri hansi mein basti hai meri saari duniya,',
        'Tere gusse mein bhi chhipi hoti hai meri hi fikar.',
        'Zindagi guzaarne ka shauq pehle kabhi na tha,',
        'Tere aane ke baad har lamha jeene ka kiya hai iraada.'
      ],
      translation: 'My whole universe lives inside your sweet laugh, and even behind your gentle scolding lies pure care for me. I never cared for long days before, but since you arrived, I yearn to live every single second.',
      category: 'sweet',
      emoji: '🥰'
    },
    {
      id: 7,
      lines: [
        'Har dua mein sirf tera hi zikr hota hai,',
        'Meri aankhon ko bas tera hi deedar hota hai.',
        'Kitni ajeeb kashish hai teri mohabbat mein,',
        'Jitna bhi dekhoon, har baar pehli nazar sa pyaar hota hai.'
      ],
      translation: 'In every prayer, it is only your name that rises; my eyes seek only your presence. Such is the enchanting power of your love that every single time I see you, it feels like falling in love for the very first time.',
      category: 'romantic',
      emoji: '🌸'
    },
    {
      id: 8,
      lines: [
        'Humne to sirf mohabbat karni seekhi thi,',
        'Tumne aakar use meri ibadat bana diya.',
        'Tu muskura de to lagta hai jannat mil gayi,',
        'Khuda ne meri aam si zindagi ko lajawab bana diya.'
      ],
      translation: 'I had only learned how to love; you arrived and turned that love into sacred worship. When you smile, it feels like I touched heaven; God turned my ordinary existence into an extraordinary blessing.',
      category: 'soulful',
      emoji: '💫'
    },
    {
      id: 9,
      lines: [
        'Faasle jismon ke darmiyaan hain to kya hua,',
        'Dil to har pal tere hi seene mein dhadakta hai.',
        'Sau meelon ki doori bhi mita nahi sakti us ehsaas ko,',
        'Jo 24 February ko pehli baar teri aankhon mein dekha tha.'
      ],
      translation: 'What if distance lies between our bodies? My heart beats inside your chest every single moment. Even hundreds of miles cannot erase the feeling that was born on 24 February when our eyes first met.',
      category: 'distance',
      emoji: '✈️'
    },
    {
      id: 10,
      lines: [
        'Screen ke us paar se bhi tera noor chamakta hai,',
        'Teri aawaz sunte hi bechain dil sambhalta hai.',
        'Door reh kar bhi tu itni qareeb hai mere,',
        'Jaise saanson mein ghula koi meetha sa khwab mehakta hai.'
      ],
      translation: 'Even through the screen, your divine light radiates; the moment I hear your voice, my restless heart finds peace. Even from miles away, you feel so close, like a sweet fragrance dissolved in my breath.',
      category: 'distance',
      emoji: '📱'
    },
    {
      id: 11,
      lines: [
        '24 February 2026 wo sunehri taareekh thi,',
        'Jab qismat ne meri har khushi tere naam likh di.',
        'Pehli mulaqat ka wo lamha thehar gaya dil mein,',
        'Tum aayi to zindagi ne jeene ki wajah seekh li.'
      ],
      translation: '24 February 2026 was that golden date when destiny wrote all my joy beside your name. The magic of that first meeting froze forever in my heart; when you arrived, my life learned its true purpose.',
      category: 'distance',
      emoji: '🌹'
    },
    {
      id: 12,
      lines: [
        'Yeh dooriyan to bas kuch lamhon ka imtihaan hain,',
        'Asal mein to tu hi meri rooh aur meri jaan hai.',
        'Gale lagane ka wo intezaar bhi kitna khoobsurat hai,',
        'Tere aane se hi to meri saari duniya abaad hai.'
      ],
      translation: 'This distance is merely a brief test of time; in truth, you are my soul and my very life. Even the sweet wait to embrace you is beautiful, for it is your presence that makes my entire world blossom.',
      category: 'distance',
      emoji: '🫂'
    },
    {
      id: 13,
      lines: [
        'Roz raat ko video call par tujhe sote hue dekhna,',
        'Door reh kar bhi chupke se tera maatha choom lena.',
        'Rab se yahi dua hai har fajar ke noor ke saath,',
        'Jaldi hi wo din aaye jab hamesha ke liye mit jaaye yeh dooriyan.'
      ],
      translation: 'Watching you fall asleep peacefully on late night video calls, kissing your forehead in my thoughts across the miles. My only prayer to God is that soon the day arrives when every distance between us disappears forever.',
      category: 'distance',
      emoji: '🌙'
    },
    {
      id: 14,
      lines: [
        'Faasle kitne bhi hon, mohabbat kam nahi hoti,',
        'Kisi ke door hone se chahat khatam nahi hoti.',
        'Tu har pal rehti hai meri dhadkanon ke qareeb,',
        'Teri yaadon se meri koi bhi shaam tanha nahi hoti.'
      ],
      translation: 'No matter the miles, our love never diminishes; physical distance cannot extinguish the flame of pure devotion. You reside close to my heartbeat every second, and in your memories, no evening of mine is ever lonely.',
      category: 'distance',
      emoji: '✈️'
    },
    {
      id: 15,
      lines: [
        'Zulfon mein teri shaam dhal jaaye to kya baat ho,',
        'Hamesha ke liye tera haath mere haath mein ho.',
        'Duniya ki kisi daulat ki tamanna nahi mujhe,',
        'Bas aakhri saans tak tera hi saath ho.'
      ],
      translation: 'What heaven it would be if my evenings melted into the warmth of your hair, with your hand resting in mine forever. I crave no riches of this earthly world; my only desire is your sweet company until my very last breath.',
      category: 'romantic',
      emoji: '🌹'
    },
    {
      id: 16,
      lines: [
        'Tu meri aadat nahi, meri ibaadat ban chuki hai,',
        'Meri rooh ko teri aisi aadat pad chuki hai.',
        '24 Feb ko jo aag dil mein jali thi chahat ki,',
        'Wo har guzarte din ke saath aur pakki ho chuki hai.'
      ],
      translation: 'You are not merely my habit; you have become my sacred prayer. The spark of love ignited on 24 Feb has grown stronger, deeper, and unbreakable with every passing day.',
      category: 'soulful',
      emoji: '🔥'
    },
    {
      id: 17,
      lines: [
        'Thodi si ziddi ho tum, thodi masoom si baat karti ho,',
        'Pata nahi kaise par seedhe dil par waar karti ho.',
        'Gusse mein bhi jab tum pouting chehra banati ho,',
        'Kasam khuda ki, duniya ki sabse pyari ladki lagti ho.'
      ],
      translation: 'A little stubborn, speaking with pure innocence, you strike straight at my heart. Even when angry with that cute pout, I swear you look like the most adorable angel on earth.',
      category: 'sweet',
      emoji: '🥺'
    },
    {
      id: 18,
      lines: [
        'Saath chalne ka jo vaada kiya hai umar bhar ka,',
        'Wo vaada nibhayenge har ek mod par.',
        'Chahe dhoop ho ya barsaat ho zindagi ki,',
        'Tujhe palkon par bithayenge har ek subah-o-shaam par.'
      ],
      translation: 'The promise of walking together for a lifetime is a vow I will uphold at every turn. Whether life brings sunny warmth or heavy rain, I will cherish and protect you like royalty every morning and night.',
      category: 'promise',
      emoji: '💍'
    },
    {
      id: 19,
      lines: [
        'Kuch log zindagi mein aate hain roshni bankar,',
        'Andheri raahon ko saja dete hain khushi bankar.',
        'Tu aayi to laga jaise zindagi ko manzil mil gayi,',
        'Tu dhadakti hai mere seene mein meri aakhri khushi bankar.'
      ],
      translation: 'Some souls enter our lives like pure light, illuminating dark corridors with joy. When you arrived, my life found its true destination; you beat inside my chest as my eternal joy.',
      category: 'soulful',
      emoji: '✨'
    },
    {
      id: 20,
      lines: [
        'Teri tasveer ko dekh kar muskurana aadat ban gayi,',
        'Har call ke baad tera intezaar chahat ban gayi.',
        'Log puchte hain itna khush kyun rehte ho aaj-kal,',
        'Humne muskura ke kaha, hume unki mohabbat mil gayi.'
      ],
      translation: 'Smiling at your photograph has become my sweet habit; waiting for your next call has become my favorite anticipation. When people ask why I smile so much lately, I happily tell them: I found true love in her.',
      category: 'distance',
      emoji: '📱'
    },
    {
      id: 21,
      lines: [
        'Mohabbat lafzon ki mohtaaj nahi hoti,',
        'Sachi chahat kisi faasle se naraaz nahi hoti.',
        'Tum chahe hazaron meel door raho mujhse,',
        'Tere bina meri koi dua aaghaaz nahi hoti.'
      ],
      translation: 'True love does not depend on hollow words, nor does it falter under physical miles. Even if you are thousands of miles away, not a single prayer of mine begins without whispering your name.',
      category: 'distance',
      emoji: '🕊️'
    },
    {
      id: 22,
      lines: [
        'Tere honthon ki muskaan mere dil ki dawa hai,',
        'Teri baaton ki mehak meri subah ki hawa hai.',
        'Manga tha rab se ek saccha saathi zindagi bhar,',
        'Tu mil gayi to laga jaise rab hi mujh par meharbaan hai.'
      ],
      translation: 'The smile on your lips is medicine for my soul, and the sweetness of your words is the fresh morning breeze. I prayed for one true companion for life, and getting you proved God has blessed me beyond measure.',
      category: 'romantic',
      emoji: '💖'
    },
    {
      id: 23,
      lines: [
        'Jab bhi tera khayal dil ke aaine mein aata hai,',
        'Mera har ek gham ek pal mein bhool jaata hai.',
        'Tu wo sukoon hai jise main har roz dhoondhta tha,',
        'Tu paas ho to waqt bhi thehar kar muskurata hai.'
      ],
      translation: 'Whenever your thought enters the mirror of my heart, all worries vanish instantly. You are the peace I searched for every single day; when you are with me, even time pauses and smiles.',
      category: 'soulful',
      emoji: '🌸'
    },
    {
      id: 24,
      lines: [
        'Haath thama hai to kabhi chhodenge nahi,',
        'Dil lagaya hai to kabhi todenge nahi.',
        '24 February ko shuru hui thi yeh kahani hamari,',
        'Is dastaan-e-ishq ko aakhri saans tak sajayenge hum.'
      ],
      translation: 'Having taken your hand, I will never let go; having given you my heart, I will never break yours. Our sacred story began on 24 February, and I will adorn this tale of love until my final breath.',
      category: 'promise',
      emoji: '🤝'
    },
    {
      id: 25,
      lines: [
        'Chhoti-chhoti baaton par tera rooth jaana,',
        'Aur phir chocolate dekh kar chupke se muskura dena.',
        'Yeh masoomiyat hi to hai jo mujhe deewana banati hai,',
        'Har pal tere aur kareeb laakar naya rang dikhati hai.'
      ],
      translation: 'Getting upset over tiny silly things, and then secretly smiling the moment chocolate appears! It is this adorable innocence that drives me crazy in love, painting my world in new colors every single day.',
      category: 'sweet',
      emoji: '🍫'
    },
    {
      id: 26,
      lines: [
        'Faaslon se darr nahi lagta ab hume,',
        'Kyunki har meel mein tera hi ehsaas basta hai.',
        'Jab bhi band karta hoon apni aankhein tanhayi mein,',
        'Mera dil seedha tere seene ke paas dhadakta hai.'
      ],
      translation: 'Distance holds no fear for us anymore, for your presence echoes in every single mile. Whenever I close my eyes in solitude, my heart beats directly beside yours.',
      category: 'distance',
      emoji: '✈️'
    },
    {
      id: 27,
      lines: [
        'Tere haseen chehre ko dekhna meri fajar ki azaan hai,',
        'Tere bina meri yeh saari duniya veeran hai.',
        'Bas ek baar muskura kar keh do "sirf tumhari hoon",',
        'Kasam khuda ki, hum to usi pal apni jaan waar dein.'
      ],
      translation: 'Looking at your gorgeous face is like the morning sunrise prayer; without you, my entire world feels desolate. Just smile and whisper "I am yours", and I swear I would surrender my life for that one moment.',
      category: 'romantic',
      emoji: '🌹'
    },
    {
      id: 28,
      lines: [
        'Woh jo kehte hain ishq ek baar hota hai,',
        'Unhone shayad tumhe kabhi dekha hi nahi.',
        'Main to har baar jab bhi tujhe dekhta hoon,',
        'Har ek baar pehle se bhi gehra pyaar hota hai.'
      ],
      translation: 'Those who say love happens only once have clearly never looked into your eyes. For every single time my gaze falls upon you, I fall in love all over again, deeper than before.',
      category: 'soulful',
      emoji: '🕯️'
    },
    {
      id: 29,
      lines: [
        'Zindagi ki dhoop ho ya ghamon ka toofaan aaye,',
        'Mera haath tere haath se kabhi na chhoot paaye.',
        'Yeh vaada hai 24 February ki us paak shuruaat ka,',
        'Maut bhi aaye toh bas tera sar mere seene par aaye.'
      ],
      translation: 'Whether life brings scorching heat or heavy storms of grief, my hand will never slip from yours. This is the sacred vow of our 24 February beginning: my arms will protect you till the very end.',
      category: 'promise',
      emoji: '💍'
    },
    {
      id: 30,
      lines: [
        'Jab gusse mein aakar tum aaina dekhti ho,',
        'Lagta hai jaise gulab par baraf jam gayi ho.',
        'Itni pyaari lagti ho gusse mein bhi meri jaan,',
        'Ki dil chahta hai jaan-boojh kar thoda aur chhed dein.'
      ],
      translation: 'When you look into the mirror with that cute angry pout, it looks like soft snow dusting a crimson rose. You look so dangerously adorable in anger, my love, that I feel tempted to tease you just a little bit more!',
      category: 'sweet',
      emoji: '🥺'
    },
    {
      id: 31,
      lines: [
        'Door reh kar bhi tu itni qareeb rehti hai,',
        'Har ek saans mein teri hi khushboo behti hai.',
        'Bas kuch dino ka faasla hai hum dono ke darmiyaan,',
        'Phir airport ke arrivals gate par hamesha ke liye mit jaayengi dooriyan.'
      ],
      translation: 'Even from across the miles, you live so close to me; your gentle fragrance flows through every breath I take. It is only a matter of a few more days until all distance melts away forever at the airport arrivals gate.',
      category: 'distance',
      emoji: '🌙'
    },
    {
      id: 32,
      lines: [
        'Aankhon mein teri saare sitaare saja doon,',
        'Dil karta hai tujhe palkon par bitha loon.',
        'Khuda kare hamari mohabbat ko kisi ki nazar na lage,',
        'Tujhe apni baahon mein duniya se chhipa loon.'
      ],
      translation: 'I want to gather all the stars of the galaxy and place them in your eyes. May God protect our love from all evil eyes; I just want to hide you safely in my arms away from the whole world.',
      category: 'romantic',
      emoji: '✨'
    },
    {
      id: 33,
      lines: [
        'Na chaand ki chahat hai, na taaron ki tamanna,',
        'Mujhe to bas har janam mein tera hi banna.',
        'Tu meri duaon ka sabse haseen inaam hai,',
        'Meri har dua ka shuru aur aakhri mukammal naam hai.'
      ],
      translation: 'I crave neither the moon nor the stars; in every lifetime, my only wish is to be yours. You are the sweetest reward for all my prayers, the beginning and completion of my soul.',
      category: 'soulful',
      emoji: '🕊️'
    },
    {
      id: 34,
      lines: [
        'Neend aati hai toh tera khwab le aati hai,',
        'Subah hoti hai toh tera muskurata chehra dikhaati hai.',
        'Aisi meethi aadat lagayi hai tumne meri jaan,',
        'Ki chai bhi bina tumhari yaad ke feeki lagti hai.'
      ],
      translation: 'When sleep arrives, it brings dreams of you; when morning dawns, it paints your smiling face. You have become such a sweet habit, my love, that even my morning tea tastes bland without thinking of you.',
      category: 'sweet',
      emoji: '🥞'
    },
    {
      id: 35,
      lines: [
        '24 February 2026 se lekar ta-umr tak,',
        'Har lamha, har pal, har saans ke ant tak.',
        'Sirf tera tha, sirf tera hoon, aur sirf tera rahoonga,',
        'Yeh dil hamesha sirf tere liye hi dhadkega.'
      ],
      translation: 'From 24 February 2026 until the end of time, through every second, every breath, and every heartbeat: I was only yours, I am only yours, and I will forever remain only yours.',
      category: 'promise',
      emoji: '💎'
    }
  ];

  public coupons: LoveCoupon[] = [
    {
      id: 1,
      title: 'Midnight Ice Cream & Drive',
      subtitle: 'Valid 24/7, anywhere, anytime, with your favorite playlist.',
      icon: '🍦',
      code: 'LOVE-ICE-01',
      terms: 'No excuses allowed. Rain or shine, warm hoodie included!',
      isRedeemed: false
    },
    {
      id: 2,
      title: 'Unlimited Hugs & Back Massage',
      subtitle: 'Instant stress relief and guaranteed forehead kisses.',
      icon: '💆',
      code: 'LOVE-HUG-02',
      terms: 'Can be redeemed repeatedly without any expiration date.',
      isRedeemed: false
    },
    {
      id: 3,
      title: 'Win Any Argument Pass',
      subtitle: 'Instant victory card. Boyfriend surrenders unconditionally.',
      icon: '👑',
      code: 'LOVE-WIN-03',
      terms: 'Boyfriend must admit you are 100% right and offer a tight hug.',
      isRedeemed: false
    },
    {
      id: 4,
      title: 'Movie Night - Your Pick',
      subtitle: 'You pick the movie, the snacks, and how many times we pause.',
      icon: '🍿',
      code: 'LOVE-FILM-04',
      terms: 'Even if it is a 3-hour romantic tearjerker, no complaining allowed!',
      isRedeemed: false
    },
    {
      id: 5,
      title: 'Chef Boyfriend: Breakfast in Bed',
      subtitle: 'Pancakes, fresh coffee, and fruits served with a morning kiss.',
      icon: '🍳',
      code: 'LOVE-FOOD-05',
      terms: 'All cooking and dishwashing handled entirely by him.',
      isRedeemed: false
    },
    {
      id: 6,
      title: 'Spontaneous Bouquet of Flowers',
      subtitle: 'Surprise fresh flowers delivered on any ordinary weekday.',
      icon: '🌹',
      code: 'LOVE-ROSE-06',
      terms: 'Just because you are loved and deserve to smile every single day.',
      isRedeemed: false
    },
    {
      id: 7,
      title: 'Long-Distance Virtual Candlelight Date',
      subtitle: 'Dress up fancy, order the same dinner, light candles on video call.',
      icon: '🕯️',
      code: 'LOVE-LDR-07',
      terms: 'Zero distractions. Just two souls on camera sharing laughter and dessert.',
      isRedeemed: false
    },
    {
      id: 8,
      title: 'Arrival Hall Reunion Hug (No Letting Go)',
      subtitle: 'Valid for a minimum 10-minute tight hug the second we meet.',
      icon: '✈️',
      code: 'LOVE-HUG-08',
      terms: 'Strictly non-negotiable! Boyfriend will lift you up and kiss your forehead.',
      isRedeemed: false
    }
  ];

  constructor() {
    this.loadFromStorage();
    this.loadFromUrlParams();
  }

  public saveConfig(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {}
  }

  public resetConfig(): void {
    this.config = { ...this.defaultConfig };
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.config = { ...this.defaultConfig, ...JSON.parse(saved) };
      }
    } catch (e) {}
  }

  private loadFromUrlParams(): void {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('to')) this.config.girlfriendName = params.get('to')!;
      if (params.has('gf')) this.config.girlfriendName = params.get('gf')!;
      if (params.has('from')) this.config.boyfriendName = params.get('from')!;
      if (params.has('bf')) this.config.boyfriendName = params.get('bf')!;
      if (params.has('date')) this.config.metDate = params.get('date')!;
      if (params.has('q')) this.config.proposalQuestion = params.get('q')!;
    } catch (e) {}
  }

  public generateShareableUrl(): string {
    const origin = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('to', this.config.girlfriendName);
    params.set('from', this.config.boyfriendName);
    params.set('date', this.config.metDate);
    if (this.config.proposalQuestion !== this.defaultConfig.proposalQuestion) {
      params.set('q', this.config.proposalQuestion);
    }
    const savedWebhook = localStorage.getItem('love_tracker_gsheet_webhook_v1');
    if (savedWebhook) {
      params.set('hook', savedWebhook);
    }
    return `${origin}?${params.toString()}`;
  }
}
