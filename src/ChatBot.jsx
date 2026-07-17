import { useEffect, useMemo, useRef, useState } from 'react'

// Supported languages. `label` is shown in the picker in its own script.
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
]

// Intent list. Order matters: the first intent whose keyword appears wins.
const INTENTS = ['book', 'emergency', 'coverage', 'payment', 'signup', 'greeting']

// Keywords are matched case-insensitively against the user's message. English
// keywords work for every language; native keywords help typed native input.
const KEYWORDS = {
  greeting: ['hi', 'hello', 'hey', 'namaste', 'नमस्ते', 'vanakkam', 'வணக்கம்', 'hola', 'bonjour', 'নমস্কার'],
  book: ['book', 'ambulance', 'request', 'call', 'ride', 'बुक', 'एम्बुलेंस', 'ஆம்புலன்ஸ்', 'అంబులెన్స్', 'ಆಂಬುಲೆನ್ಸ್', 'অ্যাম্বুলেন্স', 'reservar', 'ambulancia'],
  emergency: ['emergency', 'urgent', 'help', 'number', '108', '112', 'आपात', 'இக்கட்டு', 'అత్యవసర', 'জরুরি', 'emergencia', 'urgence'],
  coverage: ['coverage', 'area', 'city', 'available', 'where', 'क्षेत्र', 'शहर', 'பகுதி', 'ప్రాంతం', 'এলাকা', 'zona', 'zone'],
  payment: ['payment', 'pay', 'cost', 'price', 'fee', 'भुगतान', 'கட்டணம்', 'చెల్లింపు', 'পেমেন্ট', 'pago', 'paiement'],
  signup: ['sign up', 'signup', 'register', 'account', 'driver', 'साइन', 'पंजीकरण', 'பதிவு', 'నమోదు', 'নিবন্ধন', 'registro', 'inscription'],
}

// Localized UI strings + FAQ answers, keyed by language code.
const STRINGS = {
  en: {
    title: 'IntelliVehicle Assistant',
    subtitle: 'Ask me anything — 24/7',
    placeholder: 'Type your message…',
    send: 'Send',
    langLabel: 'Language',
    greeting: "Hello! I'm the IntelliVehicle assistant. How can I help you today?",
    fallback: "I'm not sure about that yet. Try one of the quick options below, or ask about booking, emergencies, coverage, payment, or sign up.",
    quick: { book: 'Book an ambulance', emergency: 'Emergency number', coverage: 'Coverage area', payment: 'Payment', signup: 'Sign up help' },
    answers: {
      book: 'To book an ambulance, tap “Get Started”, sign in, and press Request Ambulance. A nearby driver is dispatched within minutes with live tracking.',
      emergency: 'For a life-threatening emergency, call 108 (ambulance) or 112 (all-India emergency) right away. You can also request instantly from the app after signing in.',
      coverage: 'We operate 24/7 across the city with real-time GPS tracking. Enter your city and pincode during sign up to see availability near you.',
      payment: 'We support secure, flexible payments — UPI, cards, and cash. You only pay after the trip, and a receipt is saved to your account.',
      signup: 'Tap “Get Started” on the home page. Choose User Sign Up to book rides, or Driver Sign Up to respond to requests. It takes about a minute.',
    },
  },
  hi: {
    title: 'इंटेलीव्हीकल सहायक',
    subtitle: 'कुछ भी पूछें — 24/7',
    placeholder: 'अपना संदेश लिखें…',
    send: 'भेजें',
    langLabel: 'भाषा',
    greeting: 'नमस्ते! मैं इंटेलीव्हीकल सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?',
    fallback: 'मुझे इसका उत्तर अभी नहीं पता। नीचे दिए विकल्प आज़माएँ, या बुकिंग, आपातकाल, कवरेज, भुगतान या साइन अप के बारे में पूछें।',
    quick: { book: 'एम्बुलेंस बुक करें', emergency: 'आपातकालीन नंबर', coverage: 'सेवा क्षेत्र', payment: 'भुगतान', signup: 'साइन अप मदद' },
    answers: {
      book: 'एम्बुलेंस बुक करने के लिए “Get Started” दबाएँ, साइन इन करें और Request Ambulance पर टैप करें। कुछ ही मिनटों में लाइव ट्रैकिंग के साथ पास का ड्राइवर भेजा जाता है।',
      emergency: 'जानलेवा आपात स्थिति में तुरंत 108 (एम्बुलेंस) या 112 (अखिल भारतीय आपातकाल) पर कॉल करें। साइन इन करने के बाद आप ऐप से भी तुरंत अनुरोध कर सकते हैं।',
      coverage: 'हम पूरे शहर में 24/7 रीयल-टाइम जीपीएस ट्रैकिंग के साथ काम करते हैं। साइन अप करते समय अपना शहर और पिनकोड डालें ताकि आपके पास उपलब्धता दिखे।',
      payment: 'हम सुरक्षित और लचीले भुगतान स्वीकार करते हैं — UPI, कार्ड और नकद। आप यात्रा के बाद ही भुगतान करते हैं और रसीद आपके खाते में सुरक्षित रहती है।',
      signup: 'होम पेज पर “Get Started” दबाएँ। राइड बुक करने के लिए User Sign Up चुनें, या अनुरोधों का जवाब देने के लिए Driver Sign Up चुनें। इसमें लगभग एक मिनट लगता है।',
    },
  },
  ta: {
    title: 'இன்டெலிவெஹிக்கிள் உதவியாளர்',
    subtitle: 'எதையும் கேளுங்கள் — 24/7',
    placeholder: 'உங்கள் செய்தியை உள்ளிடவும்…',
    send: 'அனுப்பு',
    langLabel: 'மொழி',
    greeting: 'வணக்கம்! நான் இன்டெலிவெஹிக்கிள் உதவியாளர். நான் எப்படி உதவ முடியும்?',
    fallback: 'அதற்கான பதில் இன்னும் தெரியவில்லை. கீழே உள்ள விருப்பங்களை முயற்சிக்கவும், அல்லது முன்பதிவு, அவசரம், சேவை பகுதி, கட்டணம் அல்லது பதிவு பற்றி கேளுங்கள்.',
    quick: { book: 'ஆம்புலன்ஸ் முன்பதிவு', emergency: 'அவசர எண்', coverage: 'சேவை பகுதி', payment: 'கட்டணம்', signup: 'பதிவு உதவி' },
    answers: {
      book: 'ஆம்புலன்ஸ் முன்பதிவு செய்ய “Get Started” ஐ அழுத்தி, உள்நுழைந்து, Request Ambulance ஐ தட்டவும். சில நிமிடங்களில் நேரடி கண்காணிப்புடன் அருகிலுள்ள ஓட்டுநர் அனுப்பப்படுவார்.',
      emergency: 'உயிருக்கு ஆபத்தான அவசரநிலையில் உடனே 108 (ஆம்புலன்ஸ்) அல்லது 112 (அகில இந்திய அவசரம்) ஐ அழைக்கவும். உள்நுழைந்த பிறகு செயலியிலிருந்தும் உடனடியாக கோரலாம்.',
      coverage: 'நாங்கள் நகரம் முழுவதும் 24/7 நேரடி GPS கண்காணிப்புடன் இயங்குகிறோம். பதிவின் போது உங்கள் நகரம் மற்றும் பின்கோடு உள்ளிட்டால் அருகிலுள்ள கிடைப்பு தெரியும்.',
      payment: 'பாதுகாப்பான, நெகிழ்வான கட்டணங்களை ஏற்கிறோம் — UPI, கார்டு மற்றும் ரொக்கம். பயணத்திற்குப் பிறகே பணம் செலுத்துவீர்கள், ரசீது உங்கள் கணக்கில் சேமிக்கப்படும்.',
      signup: 'முகப்புப் பக்கத்தில் “Get Started” ஐ அழுத்தவும். பயணங்களை முன்பதிவு செய்ய User Sign Up, கோரிக்கைகளுக்கு பதிலளிக்க Driver Sign Up ஐ தேர்வுசெய்யவும். சுமார் ஒரு நிமிடம் ஆகும்.',
    },
  },
  te: {
    title: 'ఇంటెలివెహికల్ సహాయకుడు',
    subtitle: 'ఏదైనా అడగండి — 24/7',
    placeholder: 'మీ సందేశాన్ని టైప్ చేయండి…',
    send: 'పంపు',
    langLabel: 'భాష',
    greeting: 'నమస్తే! నేను ఇంటెలివెహికల్ సహాయకుడిని. నేను మీకు ఎలా సహాయం చేయగలను?',
    fallback: 'దాని గురించి ఇంకా తెలియదు. కింది ఎంపికలను ప్రయత్నించండి, లేదా బుకింగ్, అత్యవసరం, సేవా ప్రాంతం, చెల్లింపు లేదా నమోదు గురించి అడగండి.',
    quick: { book: 'అంబులెన్స్ బుక్ చేయండి', emergency: 'అత్యవసర నంబర్', coverage: 'సేవా ప్రాంతం', payment: 'చెల్లింపు', signup: 'నమోదు సహాయం' },
    answers: {
      book: 'అంబులెన్స్ బుక్ చేయడానికి “Get Started” నొక్కి, సైన్ ఇన్ చేసి, Request Ambulance నొక్కండి. కొన్ని నిమిషాల్లో లైవ్ ట్రాకింగ్‌తో సమీప డ్రైవర్ పంపబడతారు.',
      emergency: 'ప్రాణాంతక అత్యవసర పరిస్థితిలో వెంటనే 108 (అంబులెన్స్) లేదా 112 (అఖిల భారత అత్యవసరం)కు కాల్ చేయండి. సైన్ ఇన్ అయ్యాక యాప్ నుండి కూడా వెంటనే అభ్యర్థించవచ్చు.',
      coverage: 'మేము నగరమంతటా 24/7 రియల్-టైమ్ GPS ట్రాకింగ్‌తో పనిచేస్తాము. నమోదు సమయంలో మీ నగరం, పిన్‌కోడ్ నమోదు చేస్తే సమీప లభ్యత కనిపిస్తుంది.',
      payment: 'మేము సురక్షితమైన, సౌకర్యవంతమైన చెల్లింపులను అంగీకరిస్తాము — UPI, కార్డులు, నగదు. ప్రయాణం తర్వాతే చెల్లిస్తారు, రసీదు మీ ఖాతాలో సేవ్ అవుతుంది.',
      signup: 'హోమ్ పేజీలో “Get Started” నొక్కండి. రైడ్‌లు బుక్ చేయడానికి User Sign Up, అభ్యర్థనలకు స్పందించడానికి Driver Sign Up ఎంచుకోండి. సుమారు ఒక నిమిషం పడుతుంది.',
    },
  },
  kn: {
    title: 'ಇಂಟೆಲಿವೆಹಿಕಲ್ ಸಹಾಯಕ',
    subtitle: 'ಏನಾದರೂ ಕೇಳಿ — 24/7',
    placeholder: 'ನಿಮ್ಮ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ…',
    send: 'ಕಳುಹಿಸಿ',
    langLabel: 'ಭಾಷೆ',
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ಇಂಟೆಲಿವೆಹಿಕಲ್ ಸಹಾಯಕ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    fallback: 'ಅದರ ಬಗ್ಗೆ ಇನ್ನೂ ಖಚಿತವಿಲ್ಲ. ಕೆಳಗಿನ ಆಯ್ಕೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ, ಅಥವಾ ಬುಕಿಂಗ್, ತುರ್ತು, ಸೇವಾ ಪ್ರದೇಶ, ಪಾವತಿ ಅಥವಾ ಸೈನ್ ಅಪ್ ಬಗ್ಗೆ ಕೇಳಿ.',
    quick: { book: 'ಆಂಬುಲೆನ್ಸ್ ಬುಕ್ ಮಾಡಿ', emergency: 'ತುರ್ತು ಸಂಖ್ಯೆ', coverage: 'ಸೇವಾ ಪ್ರದೇಶ', payment: 'ಪಾವತಿ', signup: 'ಸೈನ್ ಅಪ್ ಸಹಾಯ' },
    answers: {
      book: 'ಆಂಬುಲೆನ್ಸ್ ಬುಕ್ ಮಾಡಲು “Get Started” ಒತ್ತಿ, ಸೈನ್ ಇನ್ ಆಗಿ, Request Ambulance ಒತ್ತಿ. ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್‌ನೊಂದಿಗೆ ಹತ್ತಿರದ ಚಾಲಕ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.',
      emergency: 'ಜೀವಕ್ಕೆ ಅಪಾಯಕಾರಿ ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಕೂಡಲೇ 108 (ಆಂಬುಲೆನ್ಸ್) ಅಥವಾ 112 (ಅಖಿಲ ಭಾರತ ತುರ್ತು) ಗೆ ಕರೆ ಮಾಡಿ. ಸೈನ್ ಇನ್ ಆದ ನಂತರ ಆ್ಯಪ್‌ನಿಂದಲೂ ತಕ್ಷಣ ವಿನಂತಿಸಬಹುದು.',
      coverage: 'ನಾವು ನಗರದಾದ್ಯಂತ 24/7 ರಿಯಲ್-ಟೈಮ್ GPS ಟ್ರ್ಯಾಕಿಂಗ್‌ನೊಂದಿಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತೇವೆ. ಸೈನ್ ಅಪ್ ವೇಳೆ ನಿಮ್ಮ ನಗರ ಮತ್ತು ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ ಹತ್ತಿರದ ಲಭ್ಯತೆ ನೋಡಿ.',
      payment: 'ನಾವು ಸುರಕ್ಷಿತ, ಹೊಂದಿಕೊಳ್ಳುವ ಪಾವತಿಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತೇವೆ — UPI, ಕಾರ್ಡ್ ಮತ್ತು ನಗದು. ಪ್ರಯಾಣದ ನಂತರವೇ ಪಾವತಿಸುತ್ತೀರಿ, ರಸೀದಿ ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಉಳಿಯುತ್ತದೆ.',
      signup: 'ಮುಖಪುಟದಲ್ಲಿ “Get Started” ಒತ್ತಿ. ರೈಡ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಲು User Sign Up, ವಿನಂತಿಗಳಿಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಲು Driver Sign Up ಆಯ್ಕೆಮಾಡಿ. ಸುಮಾರು ಒಂದು ನಿಮಿಷ ಬೇಕಾಗುತ್ತದೆ.',
    },
  },
  bn: {
    title: 'ইন্টেলিভেহিকল সহায়ক',
    subtitle: 'যেকোনো কিছু জিজ্ঞাসা করুন — 24/7',
    placeholder: 'আপনার বার্তা লিখুন…',
    send: 'পাঠান',
    langLabel: 'ভাষা',
    greeting: 'নমস্কার! আমি ইন্টেলিভেহিকল সহায়ক। আমি কীভাবে সাহায্য করতে পারি?',
    fallback: 'এটি সম্পর্কে এখনও নিশ্চিত নই। নিচের বিকল্পগুলি চেষ্টা করুন, বা বুকিং, জরুরি, সেবা এলাকা, পেমেন্ট বা সাইন আপ সম্পর্কে জিজ্ঞাসা করুন।',
    quick: { book: 'অ্যাম্বুলেন্স বুক করুন', emergency: 'জরুরি নম্বর', coverage: 'সেবা এলাকা', payment: 'পেমেন্ট', signup: 'সাইন আপ সাহায্য' },
    answers: {
      book: 'অ্যাম্বুলেন্স বুক করতে “Get Started” চাপুন, সাইন ইন করুন এবং Request Ambulance চাপুন। কয়েক মিনিটের মধ্যে লাইভ ট্র্যাকিংসহ কাছের চালক পাঠানো হয়।',
      emergency: 'জীবনঘাতী জরুরি অবস্থায় সঙ্গে সঙ্গে 108 (অ্যাম্বুলেন্স) বা 112 (সর্বভারতীয় জরুরি) নম্বরে কল করুন। সাইন ইন করার পর অ্যাপ থেকেও তৎক্ষণাৎ অনুরোধ করা যায়।',
      coverage: 'আমরা সারা শহরে 24/7 রিয়েল-টাইম GPS ট্র্যাকিংসহ কাজ করি। সাইন আপের সময় আপনার শহর ও পিনকোড দিলে কাছের সহজলভ্যতা দেখা যাবে।',
      payment: 'আমরা নিরাপদ ও নমনীয় পেমেন্ট গ্রহণ করি — UPI, কার্ড ও নগদ। আপনি যাত্রার পরেই অর্থ প্রদান করেন এবং রসিদ আপনার অ্যাকাউন্টে সংরক্ষিত থাকে।',
      signup: 'হোম পেজে “Get Started” চাপুন। রাইড বুক করতে User Sign Up, অনুরোধে সাড়া দিতে Driver Sign Up বেছে নিন। প্রায় এক মিনিট সময় লাগে।',
    },
  },
  mr: {
    title: 'इंटेलिव्हेईकल सहाय्यक',
    subtitle: 'काहीही विचारा — 24/7',
    placeholder: 'तुमचा संदेश टाइप करा…',
    send: 'पाठवा',
    langLabel: 'भाषा',
    greeting: 'नमस्कार! मी इंटेलिव्हेईकल सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकतो?',
    fallback: 'त्याबद्दल अजून खात्री नाही. खालील पर्याय वापरून पहा, किंवा बुकिंग, आणीबाणी, सेवा क्षेत्र, पेमेंट किंवा साइन अप बद्दल विचारा.',
    quick: { book: 'रुग्णवाहिका बुक करा', emergency: 'आणीबाणी क्रमांक', coverage: 'सेवा क्षेत्र', payment: 'पेमेंट', signup: 'साइन अप मदत' },
    answers: {
      book: 'रुग्णवाहिका बुक करण्यासाठी “Get Started” दाबा, साइन इन करा आणि Request Ambulance दाबा. काही मिनिटांत लाइव्ह ट्रॅकिंगसह जवळचा चालक पाठवला जातो.',
      emergency: 'जीवघेण्या आणीबाणीत लगेच 108 (रुग्णवाहिका) किंवा 112 (अखिल भारतीय आणीबाणी) वर कॉल करा. साइन इन केल्यानंतर अ‍ॅपवरूनही त्वरित विनंती करता येते.',
      coverage: 'आम्ही संपूर्ण शहरात 24/7 रिअल-टाइम GPS ट्रॅकिंगसह कार्यरत आहोत. साइन अप करताना तुमचे शहर व पिनकोड टाका म्हणजे जवळील उपलब्धता दिसेल.',
      payment: 'आम्ही सुरक्षित व लवचिक पेमेंट स्वीकारतो — UPI, कार्ड आणि रोख. तुम्ही प्रवासानंतरच पैसे भरता आणि पावती तुमच्या खात्यात जतन होते.',
      signup: 'मुख्यपृष्ठावर “Get Started” दाबा. राइड बुक करण्यासाठी User Sign Up, विनंत्यांना प्रतिसाद देण्यासाठी Driver Sign Up निवडा. सुमारे एक मिनिट लागतो.',
    },
  },
  es: {
    title: 'Asistente de IntelliVehicle',
    subtitle: 'Pregúntame lo que sea — 24/7',
    placeholder: 'Escribe tu mensaje…',
    send: 'Enviar',
    langLabel: 'Idioma',
    greeting: '¡Hola! Soy el asistente de IntelliVehicle. ¿En qué puedo ayudarte hoy?',
    fallback: 'Aún no estoy seguro de eso. Prueba una de las opciones rápidas abajo, o pregunta sobre reservas, emergencias, cobertura, pagos o registro.',
    quick: { book: 'Reservar ambulancia', emergency: 'Número de emergencia', coverage: 'Zona de cobertura', payment: 'Pago', signup: 'Ayuda de registro' },
    answers: {
      book: 'Para reservar una ambulancia, toca “Get Started”, inicia sesión y pulsa Request Ambulance. En minutos se envía un conductor cercano con seguimiento en vivo.',
      emergency: 'Ante una emergencia que amenaza la vida, llama al 108 (ambulancia) o al 112 (emergencias) de inmediato. También puedes solicitarla al instante desde la app tras iniciar sesión.',
      coverage: 'Operamos 24/7 por toda la ciudad con seguimiento GPS en tiempo real. Ingresa tu ciudad y código postal al registrarte para ver la disponibilidad cercana.',
      payment: 'Aceptamos pagos seguros y flexibles: UPI, tarjetas y efectivo. Solo pagas después del viaje y el recibo se guarda en tu cuenta.',
      signup: 'Toca “Get Started” en la página de inicio. Elige User Sign Up para reservar viajes o Driver Sign Up para atender solicitudes. Toma alrededor de un minuto.',
    },
  },
  fr: {
    title: 'Assistant IntelliVehicle',
    subtitle: 'Posez-moi vos questions — 24/7',
    placeholder: 'Tapez votre message…',
    send: 'Envoyer',
    langLabel: 'Langue',
    greeting: 'Bonjour ! Je suis l’assistant IntelliVehicle. Comment puis-je vous aider ?',
    fallback: 'Je ne suis pas encore sûr de cela. Essayez une option rapide ci-dessous, ou posez une question sur la réservation, les urgences, la couverture, le paiement ou l’inscription.',
    quick: { book: 'Réserver une ambulance', emergency: 'Numéro d’urgence', coverage: 'Zone de couverture', payment: 'Paiement', signup: 'Aide à l’inscription' },
    answers: {
      book: 'Pour réserver une ambulance, appuyez sur « Get Started », connectez-vous et appuyez sur Request Ambulance. Un conducteur proche est envoyé en quelques minutes avec suivi en direct.',
      emergency: 'En cas d’urgence vitale, appelez immédiatement le 108 (ambulance) ou le 112 (urgences). Vous pouvez aussi faire une demande instantanée depuis l’application après connexion.',
      coverage: 'Nous opérons 24h/24 et 7j/7 dans toute la ville avec un suivi GPS en temps réel. Saisissez votre ville et votre code postal lors de l’inscription pour voir la disponibilité.',
      payment: 'Nous acceptons des paiements sécurisés et flexibles — UPI, cartes et espèces. Vous payez seulement après le trajet et le reçu est enregistré sur votre compte.',
      signup: 'Appuyez sur « Get Started » sur la page d’accueil. Choisissez User Sign Up pour réserver, ou Driver Sign Up pour répondre aux demandes. Cela prend environ une minute.',
    },
  },
}

// Pick the best-matching intent for a free-text message.
function detectIntent(text) {
  const lower = text.toLowerCase()
  for (const intent of INTENTS) {
    if (KEYWORDS[intent].some((kw) => lower.includes(kw.toLowerCase()))) {
      return intent
    }
  }
  return null
}

function ChatBot() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  const t = STRINGS[lang]

  // Reset the conversation with a greeting whenever the language changes or the
  // panel is first opened, so the greeting is always in the chosen language.
  useEffect(() => {
    setMessages([{ from: 'bot', text: STRINGS[lang].greeting }])
  }, [lang])

  // Keep the latest message in view.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  const answerFor = (intent) => {
    if (intent === 'greeting') return t.greeting
    if (intent && t.answers[intent]) return t.answers[intent]
    return t.fallback
  }

  const pushExchange = (userText, intent) => {
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: userText },
      { from: 'bot', text: answerFor(intent) },
    ])
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    pushExchange(text, detectIntent(text))
    setInput('')
  }

  const handleQuick = (intent) => {
    pushExchange(t.quick[intent], intent)
  }

  const quickKeys = useMemo(() => Object.keys(t.quick), [t])

  return (
    <>
      {!open && (
        <button
          type="button"
          className="chatbot-fab"
          aria-label={t.title}
          onClick={() => setOpen(true)}
        >
          💬
        </button>
      )}

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label={t.title}>
          <header className="chatbot-header">
            <div className="chatbot-header-text">
              <span className="chatbot-title">{t.title}</span>
              <span className="chatbot-subtitle">{t.subtitle}</span>
            </div>
            <div className="chatbot-header-actions">
              <label className="chatbot-lang-label" htmlFor="chatbot-lang">
                {t.langLabel}
              </label>
              <select
                id="chatbot-lang"
                className="chatbot-lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="chatbot-close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
          </header>

          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-bubble chatbot-bubble-${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="chatbot-quick">
            {quickKeys.map((key) => (
              <button
                key={key}
                type="button"
                className="chatbot-quick-btn"
                onClick={() => handleQuick(key)}
              >
                {t.quick[key]}
              </button>
            ))}
          </div>

          <form
            className="chatbot-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
          >
            <input
              type="text"
              className="chatbot-input"
              placeholder={t.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="chatbot-send">
              {t.send}
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatBot
