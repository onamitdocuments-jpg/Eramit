/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceItem, StatMetric, Founder, CharacteristicItem, UserReview } from '../types';

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'beauty-salon',
    nameHi: 'ब्यूटी और सैलून सेवाएँ',
    nameEn: 'Beauty & Salon Services',
    descriptionHi: 'घर पर ही पेशेवर सैलून एवं ब्यूटी पार्लर और ग्रूमिंग सेवाओं का आनंद लें। महिलाओं और पुरुषों दोनों के लिए उपलब्ध।',
    descriptionEn: 'Enjoy professional salon, beauty parlor, and grooming services at the comfort of your home. Available for both men & women.',
    iconName: 'Sparkles',
    basePrice: 499,
    categoryHi: 'व्यक्तिगत सेवाएँ',
    categoryEn: 'Personal Services'
  },
  {
    id: 'ac-repair',
    nameHi: 'एसी रिपेयर एवं सर्विस',
    nameEn: 'AC Repair & Service',
    descriptionHi: 'प्रशिक्षित तकनीशियनों द्वारा एयर कंडीशनर (AC) की गहरी सफाई, गैस रिफिल, वाइब्रेशन और किसी भी खराबी का त्वरित सुधार।',
    descriptionEn: 'Deep cleaning, gas charging, vibration checks, and quick troubleshooting of split & window ACs by certified technicians.',
    iconName: 'Wind',
    basePrice: 399,
    categoryHi: 'उपकरण रिपेयर',
    categoryEn: 'Appliance Repair'
  },
  {
    id: 'plumbing',
    nameHi: 'प्लंबिंग कार्य',
    nameEn: 'Plumbing Works',
    descriptionHi: 'लीकेज ठीक करना, नए नल और सिंक लगाना, ड्रेनेज की सफाई और हर प्रकार की प्लंबिंग संबंधी समस्याओं का पक्का समाधान।',
    descriptionEn: 'Leakage fixing, faucet & sink installations, drainage cleaning, and permanent solutions for all plumbing issues.',
    iconName: 'Droplets',
    basePrice: 199,
    categoryHi: 'घरेलू मरम्मत',
    categoryEn: 'Home Repairs'
  },
  {
    id: 'electrical',
    nameHi: 'इलेक्ट्रिकल कार्य',
    nameEn: 'Electrical Works',
    descriptionHi: 'सुरक्षित और विश्वसनीय शॉर्ट सर्किट जांच, नए स्विचबोर्ड, लाइट फिटिंग, पंखा इंस्टॉलेशन और वायरिंग रिपेयर।',
    descriptionEn: 'Safe and certified short-circuit troubleshooting, new switchboard installation, light fittings, fan repairs, and wiring.',
    iconName: 'Zap',
    basePrice: 149,
    categoryHi: 'घरेलू मरम्मत',
    categoryEn: 'Home Repairs'
  },
  {
    id: 'home-cleaning',
    nameHi: 'घर की सफाई',
    nameEn: 'Home Cleaning',
    descriptionHi: 'पूरे घर, रसोई या बाथरूम की विशेष डीप क्लीनिंग। पर्यावरण के अनुकूल रसायनों और अत्याधुनिक मशीनों का उपयोग।',
    descriptionEn: 'Deep cleaning of full house, kitchen, or bathrooms using eco-friendly cleaning agents and advanced equipment.',
    iconName: 'Sparkles',
    basePrice: 899,
    categoryHi: 'सफाई सेवाएँ',
    categoryEn: 'Cleaning Services'
  },
  {
    id: 'painting',
    nameHi: 'पेंटिंग सेवाएँ',
    nameEn: 'Painting Services',
    descriptionHi: 'विशेषज्ञों द्वारा दीवारों के रंग का चयन, पुट्टी कार्य, वॉश करने योग्य पेंटिंग और वाटरप्रूफिंग ट्रीटमेंट।',
    descriptionEn: 'Color consultation with painting experts, wall putty application, premium washable painting, and waterproofing treatment.',
    iconName: 'Paintbrush',
    basePrice: 1999,
    categoryHi: 'घरेलू मरम्मत',
    categoryEn: 'Home Repairs'
  },
  {
    id: 'carpentry',
    nameHi: 'कारपेंट्री सेवाएँ',
    nameEn: 'Carpentry Services',
    descriptionHi: 'कमरे के फर्नीचर की मरम्मत, नए दरवाजे, वार्डरोब सेटअप, स्लाइडिंग चैनल ठीक करना और कस्टमाइज्ड लकड़ी का कार्य।',
    descriptionEn: 'Repairing furniture, new door alignments, wardrobe setups, fixing drawer tracks, and customized woodwork solutions.',
    iconName: 'Hammer',
    basePrice: 249,
    categoryHi: 'घरेलू मरम्मत',
    categoryEn: 'Home Repairs'
  },
  {
    id: 'appliance-repair',
    nameHi: 'उपकरण (Appliance) रिपेयर',
    nameEn: 'Appliance Repair',
    descriptionHi: 'वॉशिंग मशीन, रेफ्रिजरेटर, ओवन और गीजर जैसी रोजमर्रा की घरेलू मशीनों की उसी दिन त्वरित जाँच और मरम्मत।',
    descriptionEn: 'Same-day diagnostics and repair of washing machines, refrigerators, microwave ovens, and water geysers.',
    iconName: 'Wrench',
    basePrice: 299,
    categoryHi: 'उपकरण रिपेयर',
    categoryEn: 'Appliance Repair'
  },
  {
    id: 'ro-water',
    nameHi: 'RO एवं वाटर प्यूरीफायर',
    nameEn: 'RO & Water Purifier',
    descriptionHi: 'आर ओ (RO) फ़िल्टर का बदलाव, टीडीएस (TDS) स्तर की जाँच, मेम्ब्रेन की सफाई और वाटर प्यूरीफायर की व्यापक इंस्टॉलेशन।',
    descriptionEn: 'Filter replacements, water TDS monitoring, membrane cleaning, and comprehensive installation of multi-stage RO water purifiers.',
    iconName: 'ShieldAlert', // Will map properly in standard UI
    basePrice: 349,
    categoryHi: 'उपकरण रिपेयर',
    categoryEn: 'Appliance Repair'
  },
  {
    id: 'home-maintenance',
    nameHi: 'घरेलू रखरखाव सेवाएँ',
    nameEn: 'Home Maintenance Services',
    descriptionHi: 'छोटे-मोटे फिक्स, ड्रिलिंग, हैंगिंग, टीवी माउंटिंग और पूरे घर के ओवरहाल के लिए ऑल-इन-वन अप्रेंटिस सेवा।',
    descriptionEn: 'All-in-one handyman services for minor fixes, hanging pictures, drilling, TV mounting, and full home checkups.',
    iconName: 'Home',
    basePrice: 599,
    categoryHi: 'घरेलू रखरखाव',
    categoryEn: 'Home Maintenance'
  }
];

export const BUSINESS_STATS: StatMetric[] = [
  {
    id: 'revenue',
    labelHi: 'वार्षिक राजस्व (Revenue)',
    labelEn: 'Annual Revenue',
    valueHi: '₹1,144 करोड़+',
    valueEn: '₹1,144 Crore+',
    subtextHi: 'वित्त वर्ष (FY) 2026 में रिकॉर्ड वृद्धि',
    subtextEn: 'Record-shattering growth in FY 2026',
    iconName: 'TrendingUp',
    colorClass: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'profit',
    labelHi: 'शुद्ध लाभ (Net Profit)',
    labelEn: 'Net Profit',
    valueHi: '₹240 करोड़',
    valueEn: '₹240 Crore',
    subtextHi: 'समेकित मुनाफ़ा और स्वस्थ वित्तीय स्थिति',
    subtextEn: 'Healthy consolidated profit and cash flows',
    iconName: 'Coins',
    colorClass: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'customers',
    labelHi: 'वार्षिक ग्राहक',
    labelEn: 'Annual Customers',
    valueHi: '68 लाख (6.8M)',
    valueEn: '6.8 Million (68 Lakh)',
    subtextHi: 'पूरे विश्व में खुशहाल परिवार',
    subtextEn: 'Happy families served globally',
    iconName: 'Users',
    colorClass: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'partners',
    labelHi: 'मासिक सक्रिय सेवा भागीदार',
    labelEn: 'Active Service Partners',
    valueHi: '47,888+',
    valueEn: '47,888+ Monthly',
    subtextHi: 'प्रशिक्षित एवं वित्तीय रूप से सशक्त पेशेवर',
    subtextEn: 'Trained and financially empowered professionals',
    iconName: 'Briefcase',
    colorClass: 'from-violet-500 to-purple-600'
  },
  {
    id: 'regions',
    labelHi: 'संचालन क्षेत्र',
    labelEn: 'Operating Regions',
    valueHi: '5 देश',
    valueEn: '5 Countries',
    subtextHi: 'भारत, UAE, सिंगापुर, सऊदी अरब आदि',
    subtextEn: 'India, UAE, Singapore, Saudi Arabia, etc.',
    iconName: 'Globe',
    colorClass: 'from-sky-500 to-blue-600'
  }
];

export const FOUNDERS: Founder[] = [
  {
    name: 'Amit Kumar Chaudhary',
    roleHi: 'सह-संस्थापक एवं मुख्य कार्यकारी अधिकारी (CEO)',
    roleEn: 'Co-Founder & CEO',
    bioHi: 'अमित कुमार चौधरी का दृढ़ विश्वास है कि ग्रामीण और शहरी दोनों क्षेत्रों के प्रत्येक पेशेवर को सम्मानजनक आजीविका और ग्राहकों को सुरक्षित सेवाएं मिलनी चाहिए।',
    bioEn: 'Amit Kumar Chaudhary firmly believes that every service professional, whether rural or urban, deserves a dignified livelihood and every customer deserves safe services.',
    imageIcon: 'User'
  },
  {
    name: 'Madhusudan Yadav',
    roleHi: 'सह-संस्थापक एवं मुख्य उत्पाद अधिकारी (CPO)',
    roleEn: 'Co-Founder & CPO',
    bioHi: 'मधुसूदन यादव तकनीक और सरल यूजर इंटरफेस के माध्यम से होम सर्विसेज़ को पारदर्शी, भरोसेमंद और सबके लिए सुलभ बनाने के लिए समर्पित हैं।',
    bioEn: 'Madhusudan Yadav is dedicated to making home services highly transparent, reliable, and universally accessible using cutting-edge product experiences.',
    imageIcon: 'User'
  }
];

export const CHARACTERISTICS: CharacteristicItem[] = [
  {
    id: 'verified',
    titleHi: 'प्रशिक्षित एवं सत्यापित पेशेवर',
    titleEn: 'Trained & Verified Professionals',
    descHi: 'हमारे सभी भागीदारों का कड़ा बैकग्राउंड वेरिफिकेशन और उच्च मानक ट्रेनिंग होती है ताकि आपको सुरक्षित और उत्कृष्ट सेवा मिले।',
    descEn: 'All partners undergo strict background verification and high-standard training to ensure safe and outstanding services.',
    iconName: 'ShieldCheck'
  },
  {
    id: 'easy-booking',
    titleHi: 'आसान ऑनलाइन बुकिंग',
    titleEn: 'Seamless Online Booking',
    descHi: 'वेबसाइट या मोबाइल ऐप पर बस 3 टैप में अपनी सुविधानुसार समय स्लॉट बुक करें और आराम करें।',
    descEn: 'Book any service in just 3 clicks at your preferred date and time, then sit back and relax.',
    iconName: 'Calendar'
  },
  {
    id: 'transparent',
    titleHi: 'पारदर्शी मूल्य निर्धारण',
    titleEn: 'Transparent Pricing',
    descHi: 'कोई छिपा हुआ शुल्क नहीं। बुकिंग के समय ही सटीक रेट कार्ड देखें और बिलिंग के समय परेशानी मुक्त रहें।',
    descEn: 'No hidden fees. Check precise charges upfront before booking and experience absolute clarity.',
    iconName: 'FileText'
  },
  {
    id: 'pay-secure',
    titleHi: 'सुरक्षित भुगतान प्रणाली',
    titleEn: 'Secure Payment System',
    descHi: 'ऑनलाइन कार्ड, यूपीआई (UPI), नेट बैंकिंग या सेवा समाप्त होने के बाद नकद भुगतान (COD) की सुविधा।',
    descEn: 'Safe checkout via UPI, credit/debit cards, net banking, or easily pay in cash after the service is completed.',
    iconName: 'CreditCard'
  },
  {
    id: 'ratings',
    titleHi: 'रेटिंग एवं समीक्षा प्रणाली',
    titleEn: 'Rating & Feedback Loop',
    descHi: 'प्रत्येक सेवा के बाद ग्राहकों का सीधा मूल्यांकन हमारे सेवा मानकों को लगातार सुधारने का अवसर देता है।',
    descEn: 'Direct rating and transparent customer reviews after each visit help us keep our service quality extremely high.',
    iconName: 'Star'
  },
  {
    id: 'monitoring',
    titleHi: 'सेवा गुणवत्ता की निगरानी',
    titleEn: 'Service Quality Monitoring',
    descHi: 'विशेष आंतरिक टीम वास्तविक समय में सेवा गुणवत्ता पर कड़ी नज़र रखती है ताकि ग्राहकों की खुशी सुनिश्चित हो सके।',
    descEn: 'A dedicated internal supervisor group monitors work quality in real-time, ensuring customer satisfaction.',
    iconName: 'Eye'
  }
];

export const BASE_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    userNameHi: 'राहुल शर्मा',
    userNameEn: 'Rahul Sharma',
    rating: 5,
    commentHi: 'एसी रिपेयर के लिए मैंने सर्विस बुक की थी। बहुत ही शानदार अनुभव रहा। तकनीशियन समय पर आया और सर्विसिंग के बाद एसी बिल्कुल नया जैसा चलने लगा।',
    commentEn: 'Booked AC repair. Fantastic experience. The technician arrived on time and after servicing, the AC runs incredibly quiet and cold.',
    serviceId: 'ac-repair',
    date: '2026-05-12',
    locationHi: 'संत कबीर नगर, खलीलाबाद',
    locationEn: 'Sant Kabir Nagar, Khalilabad'
  },
  {
    id: 'rev-2',
    userNameHi: 'अंजली गुप्ता',
    userNameEn: 'Anjali Gupta',
    rating: 5,
    commentHi: 'ब्यूटी और सैलून सर्विस घर पर ही पाना बहुत आरामदायक है। सौंदर्य एक्सपर्ट ने स्वच्छता का पूरा ध्यान रखा और सर्विस बेहतरीन थी।',
    commentEn: 'Getting salon services at home is very convenient. The expert maintained absolute hygiene. Highly recommended!',
    serviceId: 'beauty-salon',
    date: '2026-05-24',
    locationHi: 'इंडस्ट्रियल एरिया, खलीलाबाद',
    locationEn: 'Industrial Area, Khalilabad'
  },
  {
    id: 'rev-3',
    userNameHi: 'विक्रम यादव',
    userNameEn: 'Vikram Yadav',
    rating: 4,
    commentHi: 'प्लंबर ने घर के दो टपकते हुए नल बहुत ही कुशलता से आधे घंटे में ठीक कर दिए। कीमत भी बहुत पारदर्शी थी। बहुत अच्छा काम!',
    commentEn: 'The plumber fixed two leaky taps efficiently within thirty minutes. Price was absolutely fair and transparent. Great job!',
    serviceId: 'plumbing',
    date: '2026-05-18',
    locationHi: 'बस्ती रोड, खलीलाबाद',
    locationEn: 'Basti Road, Khalilabad'
  },
  {
    id: 'rev-4',
    userNameHi: 'प्रियंका राय',
    userNameEn: 'Priyanka Rai',
    rating: 5,
    commentHi: 'गीजर इंस्टॉलेशन और वायरिंग चेक के लिए इलेक्ट्रिकल सेवा ली थी। तकनीशियन पूरी सुरक्षा किट और उपकरणों के साथ आए थे।',
    commentEn: 'Requested electrical switchboard check-up and geyser wiring. Fully equipped professional, safe and quick resolution.',
    serviceId: 'electrical',
    date: '2026-05-28',
    locationHi: 'गोला बाजार, खलीलाबाद',
    locationEn: 'Gola Bazar, Khalilabad'
  }
];
