import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Member {
  id: string;
  membership_id: string;
  name: string;
  father_name: string;
  mobile: string;
  address: string;
  district: string;
  state: string;
  photo_url: string;
  role: 'Social Worker' | 'Sahayak' | 'Adhyaksh';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string | null;
  created_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN';
  created_at: string;
}

export interface OrganizationSettings {
  org_name: string;
  org_name_hindi: string;
  tagline: string;
  logo_url: string;
  contact_number: string;
  email: string;
  address: string;
  whatsapp_group_link: string;
  authorized_person_name: string;
  authorized_person_designation: string;
  signature_url: string;
  org_qr_url: string;
  registration_year: number;
  id_card_validity_years: number;
  updated_at: string;
}

export interface HomepageSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  order_num: number;
  is_active: boolean;
  created_at: string;
}

export interface HistorySection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  short_intro: string;
  full_content: string;
  image_url: string;
  order_num: number;
  is_published: boolean;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  title_color: string;
  content: string;
  image_url: string;
  category: string;
  status: 'published' | 'draft';
  published_at: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

interface DatabaseSchema {
  members: Member[];
  admins: AdminUser[];
  organization_settings: OrganizationSettings;
  homepage_slides: HomepageSlide[];
  history_sections: HistorySection[];
  posts: Post[];
  counters: {
    membership_seq: number;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: OrganizationSettings = {
  org_name: 'Paswan Ekta Manch',
  org_name_hindi: 'पासवान एकता मंच',
  tagline: 'एकता • समानता • सामाजिक न्याय • सेवा',
  logo_url: '/default-assets/logo.svg',
  contact_number: '',
  email: 'paswanektamanchpakribarama@gmail.com',
  address: 'Village: AT Pakri, Post: Pakribarama, District: Nawada, State: Bihar, Country: India',
  whatsapp_group_link: '',
  authorized_person_name: 'Shri Ram Vilas Paswan Ji Smriti Sanrakshak',
  authorized_person_designation: 'Rashtriya Sangathan Mahasachiv / National Secretary',
  signature_url: '/default-assets/signature.svg',
  org_qr_url: '',
  registration_year: 2026,
  id_card_validity_years: 5,
  updated_at: new Date().toISOString(),
};

const DEFAULT_SLIDES: HomepageSlide[] = [
  {
    id: 'slide-ambedkar',
    title: 'डॉ. बाबासाहेब भीमराव अंबेडकर',
    subtitle: 'समानता • शिक्षा • न्याय',
    image_url: '/slides/slide-ambedkar.svg',
    order_num: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'slide-chauharmal',
    title: 'बाबा चौहरमल',
    subtitle: 'साहस • स्वाभिमान • एकता',
    image_url: '/slides/slide-chauharmal.svg',
    order_num: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'slide-paswan',
    title: 'श्री रामविलास पासवान',
    subtitle: 'जनसेवा • सामाजिक न्याय • समर्पण',
    image_url: '/slides/slide-paswan.svg',
    order_num: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'slide-chirag',
    title: 'श्री चिराग पासवान',
    subtitle: 'युवा नेतृत्व • विकास • सामाजिक एकता',
    image_url: '/slides/slide-chirag.svg',
    order_num: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'slide-society',
    title: 'हमारा समाज',
    subtitle: 'एकता • शिक्षा • सम्मान • विकास',
    image_url: '/slides/slide-society.svg',
    order_num: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

export const DEFAULT_HISTORY_SECTIONS: HistorySection[] = [
  {
    id: 'history-ambedkar',
    slug: 'ambedkar',
    title: 'डॉ. भीमराव अंबेडकर (Babasaheb Dr. B. R. Ambedkar)',
    subtitle: 'बोधिसत्व, भारत रत्न, संविधान निर्माता एवं प्रथम विधि मंत्री',
    category: 'हमारे प्रेरणास्रोत',
    short_intro: 'भारतीय संविधान के शिल्पकार, प्रख्यात अर्थशास्त्री एवं सामाजिक न्याय के प्रणेता, जिन्होंने समानता, स्वतंत्रता, बंधुता और वंचित वर्गों के मानवीय अधिकारों की रक्षा हेतु अपना संपूर्ण जीवन समर्पित किया।',
    full_content: `### १. जन्म एवं प्रारंभिक जीवन (Birth and Early Life)
डॉ. भीमराव रामजी अंबेडकर (बाबासाहेब) का जन्म १४ अप्रैल १८९१ को मध्य प्रांत (वर्तमान मध्य प्रदेश) के महू छावनी नगर में सूबेदार रामजी मालोजी सकपाल एवं माता भीमाबाई की १४वीं संतान के रूप में हुआ। उस कालखंड में समाज में व्याप्त छुआछूत और जातीय भेदभाव की कठोर कुरीतियों के कारण उन्हें बचपन में विद्यालयीन शिक्षा के दौरान गंभीर उपेक्षा व अपमान का सामना करना पड़ा। कक्षा में अलग जमीन पर बैठकर पढ़ने से लेकर पानी पीने तक के लिए होने वाले भेदभाव ने उनके बालमन में सामाजिक विषमता को समाप्त कर मानवीय गरिमा स्थापित करने का दृढ़ संकल्प पैदा किया।

### २. उच्च शिक्षा एवं ऐतिहासिक अकादमिक उपलब्धियां (Education & Academic Achievements)
बाबासाहेब ज्ञान के अथाह सागर थे और आधुनिक भारत के सर्वाधिक शिक्षित व्यक्तित्वों में अग्रणी थे:
- **बॉम्बे विश्वविद्यालय (एल्फिंस्टन कॉलेज)**: १९१२ में अर्थशास्त्र और राजनीति विज्ञान में स्नातक (बी.ए.) उपाधि प्राप्त की।
- **कोलंबिया विश्वविद्यालय, न्यूयॉर्क (अमेरिका)**: बड़ौदा रियासत के महाराजा सयाजीराव गायकवाड़ की छात्रवृत्ति पर उच्च शिक्षा हेतु अमेरिका गए। १९१५ में स्नातकोत्तर (एम.ए.) और १९२७ में अर्थशास्त्र में पीएच.डी. (Ph.D.) की डिग्री प्राप्त की।
- **लंदन स्कूल ऑफ इकोनॉमिक्स (LSE), ब्रिटेन**: एम.एससी. (M.Sc.) और प्रतिष्ठित डी.एससी. (D.Sc. - डॉक्टर ऑफ साइंस) की उपाधि अर्जित की।
- **ग्रेज इन (लंदन)**: बार-एट-लॉ की परीक्षा उत्तीर्ण कर उच्च कोटि के बैरिस्टर बने।
- उन्होंने बॉम्बे के गवर्नमेंट लॉ कॉलेज के प्राचार्य के रूप में भी सेवा दी तथा भारतीय रिजर्व बैंक (RBI) की वैचारिक रूपरेखा उनके शोध ग्रंथ 'The Problem of the Rupee: Its Origin and Its Solution' पर आधारित थी।

### ३. सामाजिक भेदभाव व अस्पृश्यता के विरुद्ध ऐतिहासिक संघर्ष (Struggle Against Untouchability & Discrimination)
बाबासाहेब ने वंचितों को उनके नैसर्गिक मानवीय अधिकार दिलाने के लिए संगठित आंदोलनों का नेतृत्व किया:
- **बहिष्कृत हितकारिणी सभा (१९२४)**: वंचितों के सामाजिक व शैक्षणिक उत्थान के लिए स्थापना की।
- **महाड़ सत्याग्रह (२० मार्च १९२७)**: महाराष्ट्र के महाड़ में सार्वजनिक 'चवदार तालाब' से अछूतों के जल पीने के मानवीय अधिकार हेतु सत्याग्रह किया। यह जल का नहीं, बल्कि मानव सम्मान व समानता का ऐतिहासिक आंदोलन था।
- **कालाराम मंदिर प्रवेश सत्याग्रह (१९३०, नासिक)**: धार्मिक व सार्वजनिक स्थानों पर सभी मनुष्यों के समान अधिकार का शंखनाद।
- **पत्रकारिता द्वारा जागरण**: 'मूकनायक' (१९२०), 'बहिष्कृत भारत' (१९२७), 'समता', 'जनता' और 'प्रबुद्ध भारत' समाचार पत्रों के माध्यम से मूक समाज को वाणी दी।

### ४. अमर संदेश: "शिक्षित बनो, संगठित रहो, संघर्ष करो"
बाबासाहेब का मानना था कि आत्मसम्मान से जीने के लिए शिक्षा सबसे शक्तिशाली अस्त्र है। उनका अमर आह्वान था:
> *"शिक्षित बनो, संगठित रहो और संघर्ष करो।" (Educate, Agitate, Organize)*
उन्होंने स्पष्ट कहा कि स्वाभिमान के बिना मनुष्य का जीवन अर्थहीन है, और आत्मसम्मान से जीने के लिए व्यक्ति को स्वयं संघर्ष करना पड़ता है।

### ५. भारतीय संविधान के मुख्य शिल्पी (Chairman of the Drafting Committee & Architect of the Constitution)
- २९ अगस्त १९४७ को संविधान सभा द्वारा बाबासाहेब को **प्रारूप समिति (Drafting Committee) का अध्यक्ष** चुना गया।
- उन्होंने विश्व के विभिन्न देशों के संविधानों का गहन तुलनात्मक अध्ययन कर स्वतंत्र भारत के लिए विश्व का सबसे विस्तृत, प्रगतिशील और समतामूलक संविधान तैयार किया।
- संविधान के भाग ३ में **मौलिक अधिकार (Fundamental Rights)**, समानता का अधिकार (अनुच्छेद १४-१८), अस्पृश्यता का अंत (अनुच्छेद १७), तथा धर्म, जाति, लिंग के आधार पर भेदभाव का पूर्ण निषेध सुनिश्चित किया।
- राज्य के नीति निदेशक तत्वों (DPSP) में सामाजिक और आर्थिक लोकतंत्र की मजबूत नींव रखी।

### ६. स्वतंत्र भारत के प्रथम विधि मंत्री एवं ऐतिहासिक सुधार (First Law Minister & Progressive Reforms)
- पंडित जवाहरलाल नेहरू के प्रथम केंद्रीय मंत्रिमंडल में वे भारत के प्रथम विधि एवं न्याय मंत्री (Law Minister) बने।
- **हिंदू कोड बिल (Hindu Code Bill)**: महिलाओं को संपत्ति में समान अधिकार, विवाह और तलाक में बराबरी तथा सुरक्षा प्रदान करने के लिए क्रांतिकारी विधेयक प्रस्तुत किया। जब इस पर सहमति नहीं बनी, तो सिद्धांतों की खातिर उन्होंने मंत्री पद से त्यागपत्र दे दिया।
- **श्रमिक अधिकार व श्रम सुधार**: वायसराय की कार्यपरिषद में श्रम सदस्य रहते हुए उन्होंने काम के घंटे १२ घंटे से घटाकर ८ घंटे किए, मातृत्व अवकाश (Maternity Benefit), महिला व पुरुष श्रमिकों को समान वेतन, न्यूनतम मजदूरी, तथा कर्मचारी राज्य बीमा (ESI) की आधारशिला रखी।
- **जल व ऊर्जा संसाधन**: दामोदर घाटी परियोजना, हीराकुंड परियोजना तथा केंद्रीय जल आयोग (CWC) की संकल्पना बाबासाहेब की दूरदर्शिता का परिणाम थी।

### ७. बौद्ध धम्म दीक्षा एवं अंतिम वर्ष (Buddhist Conversion & Final Years)
बाबासाहेब ने कहा था: *"मैं उस धर्म को पसंद करता हूँ जो स्वतंत्रता, समानता और बंधुत्व सिखाता है।"*
१४ अक्टूबर १९५६ को नागपुर की पावन दीक्षाभूमि पर उन्होंने अपने लाखों अनुयायियों के साथ करुणा, प्रज्ञा, समता और वैज्ञानिक दृष्टिकोण पर आधारित बौद्ध धम्म की दीक्षा ली। उन्होंने समाज को बाह्य आडंबरों और रूढ़ियों से मुक्त होकर नैतिक जीवन जीने का मार्ग दिखाया।

### ८. महापरिनिर्वाण एवं अमर योगदान (Mahaparinirvan & Lasting Contribution)
- ६ दिसंबर १९५६ को नई दिल्ली स्थित उनके आवास पर उनका महापरिनिर्वाण हुआ। मुंबई के दादर स्थित 'चैत्य भूमि' पर लाखों शोकाकुल लोगों ने उन्हें अंतिम विदाई दी।
- मरणोपरांत वर्ष १९९० में भारत सरकार ने उन्हें देश के सर्वोच्च नागरिक सम्मान **"भारत रत्न" (Bharat Ratna)** से विभूषित किया।
- बाबासाहेब केवल एक जाति या वर्ग के नहीं, बल्कि संपूर्ण राष्ट्र और मानवता के मार्गदर्शक हैं। आज भी उनका जीवन करोड़ों लोगों को स्वाभिमान, ज्ञान और सामाजिक न्याय की प्रेरणा देता है।`,
    image_url: '/default-assets/ambedkar.svg',
    order_num: 1,
    is_published: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'history-chauharmal',
    slug: 'chauharmal',
    title: 'बाबा चौहरमल (Baba Chauharmal)',
    subtitle: 'स्वाभिमान, अदम्य साहस एवं सामाजिक एकता के अमर लोक-नायक',
    category: 'हमारे प्रेरणास्रोत',
    short_intro: 'पासवान (दुसाध) समाज के पूज्य लोक-नायक एवं स्वाभिमान के प्रतीक, जिन्होंने लोक-परंपरा में साहस, आत्म-सम्मान, सामाजिक समरसता और अन्याय के विरुद्ध अडिग खड़े रहने की प्रेरणा दी।',
    full_content: `### १. ऐतिहासिक एवं सांस्कृतिक महत्व (Historical & Cultural Significance)
बाबा चौहरमल बिहार, विशेषकर मगध, मोकामा टाल, लखीसराय एवं अंग क्षेत्र की लोक-संस्कृति में शौर्य, आत्मसम्मान और सामाजिक न्याय के अमर प्रतीक हैं। लोक-मानस में उन्हें एक ऐसे वीर, नीतिवान और जनरक्षक के रूप में स्मरण किया जाता है, जिन्होंने समाज के वंचित और शोषित वर्ग के अधिकारों और स्वाभिमान की रक्षा के लिए आजीवन संघर्ष किया।

### २. लोक-मान्यता एवं मौखिक परंपरा का आदर (Tradition & Oral Heritage - स्पष्ट प्रस्तुतीकरण)
बाबा चौहरमल जी से जुड़े अधिकांश प्रसंग एवं गाथाएं सदियों से पीढ़ी-दर-पीढ़ी चली आ रही **लोक-मान्यताओं (Folk Traditions), लोक-गीतों (बिरहा एवं चौहरमल गाथा) तथा मौखिक इतिहास (Oral History)** के रूप में समाज की चेतना में जीवित हैं। 
> *विशेष ध्यान दें: इतिहास और समाजशास्त्र के विद्वानों के अनुसार, यह परंपरा किसी लिखित दरबारी दस्तावेज के बजाय लोक-संस्कृति और जनश्रुतियों का गौरवशाली अंग है। पासवान एकता मंच इसे समाज की अमूल्य सांस्कृतिक धरोहर, वीरता और स्वाभिमान के प्रतीक के रूप में अत्यंत आदरपूर्वक प्रस्तुत करता है।*

### ३. दुसाध/पासवान समाज से आत्मीय जुड़ाव एवं कुल-गौरव (Connection with the Community)
पासवान (दुसाध) समाज बाबा चौहरमल को अपने आराध्य लोक-नायक एवं कुल-गौरव के रूप में पूजता है:
- **मोकामा टाल एवं चौहरमल मेला**: पटना जिले के मोकामा टाल (अंजनी, शंभूचक आदि) क्षेत्र में प्रतिवर्ष चैत्र/वैशाख पूर्णिमा के अवसर पर ऐतिहासिक 'बाबा चौहरमल मेला' आयोजित होता है। इस मेले में बिहार, झारखंड, उत्तर प्रदेश, पश्चिम बंगाल एवं नेपाल से लाखों श्रद्धालु एकत्र होते हैं।
- **वीरता एवं रक्षा की परंपरा**: पारंपरिक लोक-गाथाओं में दुसाध समाज को ऐतिहासिक रूप से साहसी रक्षक, दुर्गपाल और कुशल योद्धा माना गया है। बाबा चौहरमल इस शौर्य परंपरा के सर्वोच्च प्रतीक हैं।
- **गाथा गायन**: ग्रामीण क्षेत्रों में आज भी पारंपरिक वाद्ययंत्रों (ढोलक, करताल, हुड़का) के साथ 'बाबा चौहरमल की गाथा' बड़े उत्साह और श्रद्धा से गाई जाती है।

### ४. साहस, स्वाभिमान और सामाजिक एकता के आदर्श (Courage, Self-Respect & Unity)
बाबा चौहरमल की लोक-कथाओं का मूल संदेश आत्म-सम्मान और बराबरी है:
- **सामंती अन्याय का विरोध**: लोक-गाथाओं के अनुसार, उन्होंने तत्कालीन प्रभुत्ववादी और सामंती शोषण के समक्ष झुकने से साफ इनकार कर दिया था। उन्होंने सिखाया कि किसी के सामने दीन-हीन बनकर जीने से बेहतर स्वाभिमान के साथ सिर उठाकर जीना है।
- **निर्बलों एवं असहायों की सहायता**: उन्होंने सदैव कमजोरों, दीन-दुखियों और समाज के हर वर्ग के पीड़ितों की रक्षा की।
- **प्रेम और समरसता**: लोक-गाथाओं में रेशमा और चौहरमल के प्रसंग के माध्यम से सामाजिक सद्भाव, त्याग और उच्च नैतिक चरित्र को दर्शाया गया है।

### ५. आधुनिक संदर्भ में प्रासंगिकता एवं संकल्प (Contemporary Relevance)
आज के आधुनिक युग में बाबा चौहरमल की स्मृति हमें स्मरण कराती है कि:
१. **आत्मसम्मान से समझौता न करें**: समाज का प्रत्येक व्यक्ति अपने श्रम और मर्यादा के बल पर आदरणीय है।
२. **एकता ही शक्ति है**: आपस में संगठित होकर ही समाज अपने अधिकारों को प्राप्त कर सकता है।
३. **शिक्षा एवं विकास का मार्ग**: बाबा चौहरमल के स्वाभिमान को बनाए रखने का सर्वश्रेष्ठ उपाय है कि हम अपने बच्चों को शिक्षित बनाएं और सामाजिक कुरीतियों को दूर करें।
पासवान एकता मंच बाबा चौहरमल के शौर्य और स्वाभिमान के आदर्शों को नमन करता है।`,
    image_url: '/default-assets/chauharmal.svg',
    order_num: 2,
    is_published: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'history-paswan',
    slug: 'paswan',
    title: 'श्री रामविलास पासवान (Shri Ram Vilas Paswan)',
    subtitle: 'पूर्व केंद्रीय मंत्री, पद्म भूषण, सर्वमान्य जननेता एवं वंचितों की सशक्त आवाज',
    category: 'हमारे प्रेरणास्रोत',
    short_intro: '8 बार लोकसभा व 2 बार राज्यसभा सांसद, विभिन्न प्रधानमंत्रियों के मंत्रिमंडलों में केंद्रीय मंत्री, जिन्होंने सदैव गरीबों, शोषितों, श्रमिकों और वंचित वर्ग के कल्याण हेतु संसद से सड़क तक संघर्ष किया।',
    full_content: `### १. जन्म एवं प्रारंभिक जीवन (Birth & Early Life)
श्री रामविलास पासवान जी का जन्म ५ जुलाई १९४६ को बिहार के खगड़िया जिले के अलौली प्रखंड स्थित 'शहरबन्नी' गांव में एक साधारण किसान परिवार में हुआ। उनके पिता का नाम श्री जामुन पासवान एवं माता का नाम श्रीमती सिया देवी था। कोसी नदी के बाढ़ प्रभावित क्षेत्र में पले-बढ़े रामविलास जी ने बचपन से ही ग्रामीण जीवन की कठिनाइयों, गरीबी और सामाजिक असमानता को बहुत करीब से देखा, जिसने उनके मन में वंचित समाज के उत्थान की गहरी ललक जगाई।

### २. शिक्षा एवं प्रशासनिक सेवा चयन (Education & BPSC Selection)
- उन्होंने कोसी कॉलेज, खगड़िया से स्नातक की शिक्षा पूर्ण की।
- इसके उपरांत पटना विश्वविद्यालय से इतिहास में एम.ए. (M.A.) तथा विधि में स्नातक (LL.B.) की उपाधियां प्राप्त कीं।
- वे अत्यंत मेधावी छात्र थे। वर्ष १९६९ में उन्होंने बिहार लोक सेवा आयोग (BPSC) की कठिन प्रशासनिक परीक्षा उत्तीर्ण की और उनका चयन **उप पुलिस अधीक्षक (DSP - Deputy Superintendent of Police)** के राजपत्रित पद पर हुआ।
- किंतु जनता की सेवा और समाज में परिवर्तन लाने की प्रबल भावना के कारण उन्होंने सुरक्षित सरकारी नौकरी का मोह त्याग दिया और सीधे सक्रिय राजनीति व जनसेवा का कांटों भरा रास्ता चुना।

### ३. राजनीतिक जीवन का प्रारंभ एवं संघर्ष (Beginning of Political Career)
- **१९६९ में प्रथम बार विधायक**: मात्र २३ वर्ष की आयु में वे संयुक्त सोशलिस्ट पार्टी (SSP) के टिकट पर अलौली विधानसभा क्षेत्र से बिहार विधानसभा के सदस्य निर्वाचित हुए।
- वे डॉ. राम मनोहर लोहिया, कर्पूरी ठाकुर और लोकनायक जयप्रकाश नारायण (जेपी) के समाजवादी विचारों से गहराई से प्रभावित थे।
- **१९७४ का जेपी आंदोलन एवं आपातकाल**: उन्होंने संपूर्ण क्रांति आंदोलन में बढ़-चढ़कर भाग लिया। १९७५ में जब देश में आपातकाल (Emergency) लागू हुआ, तो उन्हें गिरफ्तार कर जेल भेज दिया गया, जहाँ उन्होंने लगभग दो वर्ष तक कारावास की यातनाएं सही।

### ४. संसदीय यात्रा एवं हाजीपुर से ऐतिहासिक विश्व रिकॉर्ड (Parliamentary Career & World Record)
- **१९७७ का ऐतिहासिक जनादेश**: आपातकाल के बाद १९७७ के आम चुनाव में वे जनता पार्टी के प्रत्याशी के रूप में हाजीपुर (बिहार) लोकसभा क्षेत्र से चुनाव लड़े। उन्होंने रिकॉर्ड **४,२४,५४५ मतों के अंतर से विजय** हासिल की, जो उस समय का **'गिनीज बुक ऑफ वर्ल्ड रिकॉर्ड्स' (Guinness World Record)** बना।
- **१९८९ में अपना ही रिकॉर्ड तोड़ा**: १९८९ के लोकसभा चुनाव में उन्होंने पुनः हाजीपुर से ५ लाख ४ हजार से अधिक मतों के अभूतपूर्व अंतर से जीतकर अपना ही पिछला रिकॉर्ड तोड़ दिया।
- वे कुल **८ बार लोकसभा सांसद** तथा **२ बार राज्यसभा सांसद** निर्वाचित हुए और पांच दशकों से अधिक समय तक भारतीय संसद में समाज के सबसे कमजोर तबके की निर्भीक आवाज बने रहे।

### ५. केंद्रीय मंत्री के रूप में ऐतिहासिक कार्य (Distinguished Service as Union Minister)
श्री पासवान जी ने देश के छह अलग-अलग प्रधानमंत्रियों (वी.पी. सिंह, एच.डी. देवेगौड़ा, इंद्र कुमार गुजराल, अटल बिहारी वाजपेयी, डॉ. मनमोहन सिंह और नरेंद्र मोदी) के मंत्रिमंडलों में महत्वपूर्ण विभागों का कुशल संचालन किया:
- **केंद्रीय श्रम एवं कल्याण मंत्री (१९८९-१९९०)**:
  - उन्होंने सामाजिक न्याय की दिशा में मील का पत्थर साबित हुई **'मंडल आयोग' (Mandal Commission)** की सिफारिशों को लागू कराने में ऐतिहासिक और निर्णायक भूमिका निभाई।
  - डॉ. भीमराव अंबेडकर जी के जन्मदिवस (१४ अप्रैल) को राष्ट्रीय अवकाश घोषित कराने तथा संसद के सेंट्रल हॉल में बाबासाहेब के तैलचित्र को स्थापित कराने में मुख्य सूत्रधार रहे।
- **केंद्रीय रेल मंत्री (१९९६-१९९८)**:
  - पूर्व मध्य रेलवे (ECR) का नया जोनल मुख्यालय हाजीपुर में स्थापित किया, जिससे उत्तर बिहार व संपूर्ण राज्य के विकास को अभूतपूर्व गति मिली।
  - देश भर के रेलवे स्टेशनों पर कार्यरत कुलियों (Porters) और चतुर्थ श्रेणी रेल कर्मियों के कल्याण, निःशुल्क पास व सामाजिक सुरक्षा हेतु ऐतिहासिक नीतियां बनाईं।
  - पिछड़े और सीमावर्ती क्षेत्रों में नई रेल लाइनों और पुलों (दीघा रेल पुल आदि) की आधारशिला रखी।
- **केंद्रीय संचार एवं सूचना प्रौद्योगिकी मंत्री (१९९९-२००१)**:
  - भारत में ग्रामीण स्तर तक मोबाइल और टेलीफोन क्रांति पहुंचाने का श्रेय उन्हें जाता है।
  - टेलीफोन कनेक्शन के लिए लगने वाली वर्षों की प्रतीक्षा सूची (Waiting List) को समाप्त कर आम जनता के लिए संचार सुलभ कराया।
  - बीएसएनएल (BSNL) के लाखों कर्मचारियों को पेंशन सुरक्षा प्रदान की।
- **केंद्रीय रसायन, उर्वरक एवं इस्पात मंत्री**: किसानों को समय पर खाद व सब्सिडी उपलब्ध कराई।
- **केंद्रीय उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्री (२०१४-२०२०)**:
  - राष्ट्रीय खाद्य सुरक्षा कानून को सुदृढ़ किया।
  - ऐतिहासिक **'वन नेशन, वन राशन कार्ड' (One Nation One Ration Card)** योजना की शुरुआत की, जिससे कोविड महामारी के समय देश के करोड़ों प्रवासी मजदूरों को किसी भी राज्य में राशन प्राप्त करने की सुविधा मिली।

### ६. दलित, पिछड़े एवं वंचित समाज के लिए आजीवन समर्पण (Champion of Social Justice)
- वर्ष १९८३ में उन्होंने सामाजिक सुरक्षा और वंचितों पर होने वाले अत्याचारों के विरोध के लिए **'दलित सेना'** का गठन किया।
- वे सदैव इस बात पर बल देते थे कि वंचितों को केवल दया नहीं, बल्कि सत्ता और संसाधनों में उनकी आबादी के अनुपात में हिस्सेदारी व सम्मान मिलना चाहिए।
- उनका आवास (१२, जनपथ, नई दिल्ली) दशकों तक देश भर से आने वाले गरीब, बीमार और जरूरतमंद लोगों के लिए खुला आश्रय स्थल बना रहा।

### ७. निधन एवं मरणोपरांत 'पद्म भूषण' सम्मान (Passing & Posthumous Padma Bhushan)
- ८ अक्टूबर २०२० को ७४ वर्ष की आयु में नई दिल्ली में उनका निधन हुआ। उनके निधन से भारतीय राजनीति और सामाजिक न्याय आंदोलन में एक अपूरणीय शून्य उत्पन्न हुआ।
- राष्ट्र के प्रति उनकी पांच दशकों की निस्वार्थ और उत्कृष्ट लोकसेवा के सम्मान में भारत सरकार ने वर्ष २०२१ में उन्हें मरणोपरांत देश के प्रतिष्ठित नागरिक सम्मान **"पद्म भूषण" (Padma Bhushan - Public Affairs)** से अलंकृत किया।
- श्री रामविलास पासवान जी का जीवन यह सिद्ध करता है कि एक साधारण ग्रामीण पृष्ठभूमि का व्यक्ति भी अपनी योग्यता, जनसमर्पण और दृढ़ संकल्प से देश के शीर्ष नेतृत्व तक पहुँच सकता है।`,
    image_url: '/default-assets/paswan.svg',
    order_num: 3,
    is_published: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'history-society',
    slug: 'society',
    title: 'हमारा समाज – एकता, शिक्षा, सम्मान और विकास (Our Society)',
    subtitle: 'सामाजिक चेतना, शैक्षणिक उत्थान, स्वाभिमान और समावेशी प्रगति का संकल्प',
    category: 'हमारा समाज',
    short_intro: 'समाज के प्रत्येक परिवार, युवा और महिला के समग्र विकास हेतु संगठित प्रयास। शिक्षा, स्वावलंबन, स्वास्थ्य, कानूनी जागरूकता और आपसी सद्भाव से एक सशक्त और समतामूलक समाज का निर्माण।',
    full_content: `### ध्येय वाक्य: "शिक्षा, एकता, सम्मान, समानता और विकास"
पासवान एकता मंच का यह दृढ़ विश्वास है कि किसी भी समाज की वास्तविक प्रगति तभी संभव है जब उसके सभी सदस्य शिक्षा से आलोकित हों, आपसी भाईचारे से एकजुट हों और अपने संवैधानिक अधिकारों व कर्तव्यों के प्रति पूर्णतः जागरूक हों। हमारा संकल्प समाज के अंतिम व्यक्ति तक विकास, सम्मान और खुशहाली पहुँचाना है।

---

### १. सामाजिक एकता एवं आपसी भाईचारा (Social Unity & Fraternity)
- **आपसी एकजुटता**: संकीर्ण मतभेदों, आपसी मनमुटाव और गुटबाजी से ऊपर उठकर समाज के सभी परिवारों को एक सूत्र में पिरोना।
- **पारस्परिक सहयोग**: समाज के किसी भी भाई-बहन पर आने वाले संकट या विपत्ति के समय पूरा समाज एकजुट होकर उनके साथ खड़ा हो।
- **सर्वसमाज के साथ सद्भाव**: भारत के संविधान में निहित बंधुता (Fraternity) के आदर्श का पालन करते हुए सभी वर्गों और समुदायों के साथ शांति, आपसी आदर और प्रेम का वातावरण बनाए रखना। किसी भी वर्ग के प्रति द्वेष या भेदभाव का कोई स्थान नहीं है।

### २. शिक्षा – समाज की प्रगति की सबसे मजबूत बुनियाद (Education & Student Guidance)
- **शत-प्रतिशत साक्षरता का लक्ष्य**: समाज का कोई भी बच्चा—विशेषकर हमारी बेटियाँ—आर्थिक तंगी के कारण पढ़ाई से वंचित न रहे।
- **मार्गदर्शन एवं प्रेरणा**: प्राथमिक विद्यालय से लेकर उच्च शिक्षा (इंजीनियरिंग, मेडिकल, विधि, प्रबंधन, सिविल सेवा) तक के विद्यार्थियों को करियर काउंसलिंग।
- **पुस्तक बैंक एवं छात्र सहायता**: ग्रामीण स्तर पर पुस्तकालय (Library) व बुक बैंक की स्थापना करना, जिससे निर्धन मेधावी छात्र प्रतियोगी परीक्षाओं की निःशुल्क पुस्तकें प्राप्त कर सकें।
- **प्रतिभा सम्मान समारोह**: बोर्ड परीक्षाओं तथा सरकारी व गैर-सरकारी नौकरियों में सफलता पाने वाले समाज के होनहार छात्र-छात्राओं को सम्मानित कर अन्य बच्चों का उत्साहवर्धन करना।

### ३. युवा विकास एवं कौशल संवर्धन (Youth Development & Skill Building)
- **कौशल विकास (Skill Development)**: युवाओं को पारंपरिक शिक्षा के साथ-साथ आधुनिक तकनीकी कौशल (आईटी, कंप्यूटर साक्षरता, डिजिटल मार्केटिंग, कोडिंग, इलेक्ट्रीशियन, ऑटोमोबाइल, पैरामेडिकल आदि) से जोड़ना।
- **रोजगार मार्गदर्शन प्रकोष्ठ**: निजी व सार्वजनिक क्षेत्र में निकलने वाली रिक्तियों की समयबद्ध जानकारी देना, बायोडाटा (Resume) तैयार करने तथा साक्षात्कार (Interview) की निःशुल्क तैयारी कराना।
- **उद्यमिता प्रोत्साहन (Entrepreneurship)**: सरकारी योजनाओं (जैसे मुद्रा लोन, स्टैंड-अप इंडिया, पीएम स्वनिधि) का लाभ दिलवाकर युवाओं को नौकरी खोजने वाले के बजाय नौकरी देने वाला उद्यमी बनने के लिए प्रेरित करना।

### ४. महिला सशक्तिकरण एवं स्वावलंबन (Women Empowerment & Dignity)
- **बालिका शिक्षा पर विशेष बल**: "एक बेटी को पढ़ाना पूरे परिवार को शिक्षित करना है।" बालिकाओं की उच्च शिक्षा को सर्वोच्च प्राथमिकता।
- **आर्थिक स्वावलंबन**: ग्रामीण व अर्ध-शहरी क्षेत्रों में महिलाओं के स्वयं सहायता समूह (Self Help Groups), सिलाई-कढ़ाई, हस्तशिल्प, गृह उद्योग एवं डिजिटल वित्तीय साक्षरता को बढ़ावा देना।
- **सामाजिक सुरक्षा व सम्मान**: घरेलू हिंसा, दहेज प्रथा और बाल विवाह जैसी कुप्रथाओं के खिलाफ कठोर सामाजिक जागरूकता अभियान।

### ५. स्वास्थ्य, स्वच्छता एवं नशामुक्ति जागरूकता (Health, Hygiene & De-addiction)
- **निःशुल्क स्वास्थ्य शिविर**: गांवों व कस्बों में योग्य चिकित्सकों के सहयोग से स्वास्थ्य जांच, नेत्र परीक्षण, रक्तदान शिविर एवं औषधि वितरण का आयोजन।
- **सरकारी स्वास्थ्य योजनाओं की पहुंच**: प्रत्येक परिवार का 'आयुष्मान भारत कार्ड' बनवाना ताकि गंभीर बीमारियों में निःशुल्क उपचार मिल सके।
- **नशामुक्ति अभियान**: शराब, तंबाकू और अन्य मादक पदार्थों से युवाओं को दूर रखने के लिए सघन जागरूकता अभियान चलाना।

### ६. संवैधानिक एवं कानूनी जागरूकता (Constitutional & Legal Awareness)
- **संविधान के प्रति सर्वोच्च निष्ठा**: भारत का संविधान हमारे अधिकारों और सम्मान का सबसे बड़ा सुरक्षा कवच है। संविधान की प्रस्तावना (Preamble), मौलिक अधिकार और कर्तव्यों का घर-घर प्रचार।
- **निःशुल्क विधिक सहायता (Legal Aid)**: यदि किसी निर्बल या शोषित व्यक्ति पर अन्याय, अत्याचार या प्रताड़ना होती है, तो मंच के विधि प्रकोष्ठ द्वारा उन्हें विधिक परामर्श और कानूनी सहायता सुलभ कराना।
- **सरकारी योजनाओं का लाभ**: राशन कार्ड, प्रधानमंत्री आवास योजना, वृद्धावस्था/दिव्यांग पेंशन, छात्रवृत्ति योजनाओं के फॉर्म भरने में सहयोग।

### ७. डिजिटल साक्षरता एवं आधुनिक युग (Digital Awareness)
- **डिजिटल सुरक्षा**: बैंक फ्रॉड, ऑनलाइन ठगी और फेक न्यूज से बचाव के उपाय सिखाना।
- **ई-गवर्नेंस सेवाओं का उपयोग**: आधार कार्ड, वोटर आईडी, पैन कार्ड, जाति/आय/निवास प्रमाण पत्र ऑनलाइन बनवाने में ग्रामीण बंधुओं की मदद करना।

### ८. असहायों, बुजुर्गों एवं जरूरतमंदों की सेवा (Helping the Poor & Needy)
- संकटकाल (प्राकृतिक आपदा, दुर्घटना, गंभीर बीमारी) में पीड़ित परिवारों को आपातकालीन राहत उपलब्ध कराना।
- अनाथ बच्चों, वृद्धजनों और दिव्यांगों के जीवन स्तर को सुधारने हेतु सामुदायिक सहयोग की व्यवस्था।

### ९. सामाजिक कुरीतियों का उन्मूलन (Eliminating Discrimination & Social Evils)
- दहेज प्रथा, मृत्युभोज, अंधविश्वास, फिजूलखर्ची जैसी कुरीतियों को त्यागकर सादगीपूर्ण जीवनशैली अपनाना।
- समाज में समानता, मानवीय गरिमा और भाईचारे की स्थापना कर एक उन्नत, जागरूक और आदर्श समाज का निर्माण करना।`,
    image_url: '/default-assets/society.svg',
    order_num: 4,
    is_published: true,
    updated_at: new Date().toISOString(),
  }
];

export const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-edu-scholarship',
    title: 'पासवान एकता मंच द्वारा निःशुल्क छात्रवृत्ति एवं शैक्षणिक मार्गदर्शन अभियान का शुभारंभ',
    title_color: '#1e3a8a',
    content: `पासवान एकता मंच के केंद्रीय कार्यालय पकरीबरावां (नवादा) द्वारा समाज के आर्थिक रूप से कमजोर एवं मेधावी छात्र-छात्राओं के लिए निःशुल्क पाठ्य सामग्री एवं छात्रवृत्ति मार्गदर्शन शिविर का आयोजन किया गया।

संगठन का मुख्य उद्देश्य समाज के प्रत्येक युवा तक गुणवत्तापूर्ण शिक्षा और समान अवसर सुनिश्चित करना है। शिविर में प्रतियोगी परीक्षाओं (UPSC, BPSC, SSC, Railway व पुलिस सेवा) की तैयारी कर रहे छात्र-छात्राओं को अनुभवी शिक्षकों द्वारा मार्गदर्शन एवं आवश्यक पुस्तकें वितरित की गईं। 

सभी सम्मानित सदस्यों एवं पदाधिकारियों से विनम्र आग्रह है कि वे अपने-अपने प्रखंड व पंचायत स्तर पर प्रतिभावान विद्यार्थियों की पहचान कर उन्हें इस जनकल्याणकारी अभियान से अवश्य जोड़ें।`,
    image_url: '/slides/slide-ambedkar.svg',
    category: 'शैक्षणिक अभियान',
    status: 'published',
    published_at: '2026-09-12',
    created_at: new Date('2026-09-12T10:00:00.000Z').toISOString(),
    updated_at: new Date('2026-09-12T10:00:00.000Z').toISOString(),
    author_name: 'केंद्रीय संगठन सचिव',
  },
  {
    id: 'post-chauharmal-sangoshthi',
    title: 'बाबा चौहरमल जी की पावन स्मृति में भव्य सामाजिक एकता एवं युवा प्रेरणा संगोष्ठी',
    title_color: '#dc2626',
    content: `आगामी माह में आयोजित होने वाली ऐतिहासिक सामाजिक एकता संगोष्ठी की तैयारियों को लेकर पकरीबरावां में राष्ट्रीय व प्रांतीय पदाधिकारियों की एक अति-महत्वपूर्ण बैठक संपन्न हुई।

बैठक की अध्यक्षता करते हुए वक्ताओं ने बाबा चौहरमल जी के त्याग, शौर्य और सामाजिक स्वाभिमान पर प्रकाश डाला। बैठक में निम्नलिखित प्रमुख निर्णय लिए गए:
१. प्रखंड व पंचायत स्तर पर जनसंपर्क यात्राओं का आयोजन।
२. युवाओं को सामाजिक कुरीतियों जैसे नशाखोरी व दहेज प्रथा से दूर रखने हेतु जनजागरण।
३. महिला स्वयं सहायता समूहों को स्वावलंबन से जोड़ने का संकल्प।

सभी जिला व प्रखंड स्तरीय कार्यकर्ता अभी से इस आयोजन की सफलता हेतु जुट जाएं।`,
    image_url: '/slides/slide-chauharmal.svg',
    category: 'सामाजिक सम्मेलन',
    status: 'published',
    published_at: '2026-09-10',
    created_at: new Date('2026-09-10T11:00:00.000Z').toISOString(),
    updated_at: new Date('2026-09-10T11:00:00.000Z').toISOString(),
    author_name: 'प्रचार-प्रसार प्रकोष्ठ',
  },
  {
    id: 'post-digital-membership-drive',
    title: 'डिजिटल सदस्यता अभियान 2026: हजारों युवाओं ने ली संगठन की सक्रिय सदस्यता',
    title_color: '#16a34a',
    content: `पासवान एकता मंच के आधुनिक डिजिटल पोर्टल के माध्यम से बिहार, उत्तर प्रदेश, झारखंड एवं दिल्ली सहित विभिन्न राज्यों से युवाओं और सामाजिक कार्यकर्ताओं का अभूतपूर्व उत्साह देखने को मिल रहा है।

पोर्टल के जरिए पंजीकरण कराने वाले योग्य आवेदकों का सत्यापन कर उन्हें डिजिटल सदस्यता पहचान पत्र (Digital ID Card with Verified QR Code) जारी किया जा रहा है। पहचान पत्र में सदस्य का पूरा स्थायी पता, फोटो, सदस्यता क्रमांक और आधिकारिक हस्ताक्षर सम्मिलित हैं।

संगठन परिवार सभी नव-पंजीकृत सदस्यों का हार्दिक अभिनंदन करता है और समाज निर्माण के इस महायज्ञ में सक्रिय योगदान की अपेक्षा रखता है।`,
    image_url: '/default-assets/logo.svg',
    category: 'संगठन समाचार',
    status: 'published',
    published_at: '2026-09-08',
    created_at: new Date('2026-09-08T09:30:00.000Z').toISOString(),
    updated_at: new Date('2026-09-08T09:30:00.000Z').toISOString(),
    author_name: 'प्रशासनिक सचिवालय',
  }
];

class Database {
  private inMemory: DatabaseSchema;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.inMemory = this.loadSync();
  }

  private loadSync(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Ensure defaults exist
        if (!parsed.organization_settings) parsed.organization_settings = DEFAULT_SETTINGS;
        if (!parsed.homepage_slides || parsed.homepage_slides.length === 0 || parsed.homepage_slides.some(s => s.image_url?.includes('unsplash.com'))) {
          parsed.homepage_slides = DEFAULT_SLIDES;
          this.saveDirectSync(parsed);
        }
        if (!parsed.history_sections || parsed.history_sections.length === 0) parsed.history_sections = DEFAULT_HISTORY_SECTIONS;
        if (!parsed.posts || parsed.posts.length === 0) {
          parsed.posts = DEFAULT_POSTS;
          this.saveDirectSync(parsed);
        }
        if (!parsed.members) parsed.members = [];
        if (!parsed.admins) parsed.admins = [];
        if (!parsed.counters) parsed.counters = { membership_seq: 0 };
        return parsed;
      }
    } catch (err) {
      console.error('Error loading database file, initializing fresh:', err);
    }

    const initial: DatabaseSchema = {
      members: [],
      admins: [],
      organization_settings: DEFAULT_SETTINGS,
      homepage_slides: DEFAULT_SLIDES,
      history_sections: DEFAULT_HISTORY_SECTIONS,
      posts: DEFAULT_POSTS,
      counters: {
        membership_seq: 0,
      }
    };
    this.saveDirectSync(initial);
    return initial;
  }

  private saveDirectSync(data: DatabaseSchema) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  private async persist(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          await fs.promises.mkdir(DATA_DIR, { recursive: true });
        }
        const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
        await fs.promises.writeFile(tempFile, JSON.stringify(this.inMemory, null, 2), 'utf-8');
        await fs.promises.rename(tempFile, DB_FILE);
      } catch (err) {
        console.error('Failed to persist database:', err);
      }
    });
    return this.writeQueue;
  }

  // --- MEMBER OPERATIONS ---

  public async getMembers(): Promise<Member[]> {
    return [...this.inMemory.members];
  }

  public async getMemberById(id: string): Promise<Member | null> {
    return this.inMemory.members.find(m => m.id === id) || null;
  }

  public async getMemberByMembershipId(membershipId: string): Promise<Member | null> {
    const normalized = membershipId.trim().toUpperCase();
    return this.inMemory.members.find(m => m.membership_id.toUpperCase() === normalized) || null;
  }

  public async getMemberByMobile(mobile: string): Promise<Member | null> {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    return this.inMemory.members.find(m => {
      const mClean = m.mobile.replace(/\D/g, '').slice(-10);
      return mClean === cleanMobile;
    }) || null;
  }

  public async authenticateMember(mobile: string, membershipId: string): Promise<Member | null> {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanId = membershipId.trim().toUpperCase();

    const member = this.inMemory.members.find(m => {
      const mMobile = m.mobile.replace(/\D/g, '').slice(-10);
      const mId = m.membership_id.trim().toUpperCase();
      return mMobile === cleanMobile && mId === cleanId;
    });

    return member || null;
  }

  /**
   * Safely generate sequential Membership ID formatted as: PEM20260001, PEM20260002...
   * Ensures thread/concurrency safety with monotonic increment.
   */
  public async createMember(data: Omit<Member, 'id' | 'membership_id' | 'status' | 'created_at'>): Promise<Member> {
    const year = this.inMemory.organization_settings.registration_year || 2026;
    
    // Find the highest existing seq number
    let highestSeq = this.inMemory.counters.membership_seq || 0;
    const prefix = `PEM${year}`;
    
    for (const m of this.inMemory.members) {
      if (m.membership_id.startsWith(prefix)) {
        const numPart = parseInt(m.membership_id.substring(prefix.length), 10);
        if (!isNaN(numPart) && numPart > highestSeq) {
          highestSeq = numPart;
        }
      }
    }

    const nextSeq = highestSeq + 1;
    this.inMemory.counters.membership_seq = nextSeq;
    const paddedSeq = String(nextSeq).padStart(4, '0');
    const membershipId = `${prefix}${paddedSeq}`;

    const newMember: Member = {
      ...data,
      id: uuidv4(),
      membership_id: membershipId,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      approved_at: null,
      rejected_at: null,
      rejection_reason: null,
    };

    this.inMemory.members.unshift(newMember);
    await this.persist();
    return newMember;
  }

  public async updateMember(id: string, updates: Partial<Omit<Member, 'id' | 'membership_id' | 'created_at'>>): Promise<Member | null> {
    const idx = this.inMemory.members.findIndex(m => m.id === id);
    if (idx === -1) return null;

    const existing = this.inMemory.members[idx];
    const updated: Member = {
      ...existing,
      ...updates,
      // Guarantee ID and membership_id never mutate
      id: existing.id,
      membership_id: existing.membership_id,
      created_at: existing.created_at,
    };

    this.inMemory.members[idx] = updated;
    await this.persist();
    return updated;
  }

  public async approveMember(id: string): Promise<Member | null> {
    const idx = this.inMemory.members.findIndex(m => m.id === id);
    if (idx === -1) return null;

    const existing = this.inMemory.members[idx];
    existing.status = 'APPROVED';
    existing.approved_at = new Date().toISOString();
    existing.rejected_at = null;
    existing.rejection_reason = null;

    await this.persist();
    return existing;
  }

  public async rejectMember(id: string, reason: string): Promise<Member | null> {
    const idx = this.inMemory.members.findIndex(m => m.id === id);
    if (idx === -1) return null;

    const existing = this.inMemory.members[idx];
    existing.status = 'REJECTED';
    existing.rejected_at = new Date().toISOString();
    existing.rejection_reason = reason;

    await this.persist();
    return existing;
  }

  public async deleteMember(id: string): Promise<boolean> {
    const idx = this.inMemory.members.findIndex(m => m.id === id);
    if (idx === -1) return false;

    this.inMemory.members.splice(idx, 1);
    await this.persist();
    return true;
  }

  // --- ADMIN OPERATIONS ---

  public async getAdmins(): Promise<AdminUser[]> {
    return [...this.inMemory.admins];
  }

  public async getAdminByUsername(username: string): Promise<AdminUser | null> {
    const normalized = username.trim().toLowerCase();
    return this.inMemory.admins.find(a => a.username.toLowerCase() === normalized) || null;
  }

  public async createAdmin(admin: Omit<AdminUser, 'id' | 'created_at'>): Promise<AdminUser> {
    const newAdmin: AdminUser = {
      ...admin,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.inMemory.admins.push(newAdmin);
    await this.persist();
    return newAdmin;
  }

  public hasAnyAdmin(): boolean {
    return this.inMemory.admins.length > 0;
  }

  public async updateAdminPassword(username: string, newPasswordHash: string): Promise<boolean> {
    const normalized = username.trim().toLowerCase();
    const admin = this.inMemory.admins.find(a => a.username.toLowerCase() === normalized);
    if (!admin) return false;
    admin.password_hash = newPasswordHash;
    await this.persist();
    return true;
  }

  // --- ORGANIZATION SETTINGS ---

  public async getSettings(): Promise<OrganizationSettings> {
    return { ...this.inMemory.organization_settings };
  }

  public async updateSettings(updates: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    this.inMemory.organization_settings = {
      ...this.inMemory.organization_settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.persist();
    return { ...this.inMemory.organization_settings };
  }

  // --- HOMEPAGE SLIDES ---

  public async getSlides(): Promise<HomepageSlide[]> {
    return [...this.inMemory.homepage_slides].sort((a, b) => a.order_num - b.order_num);
  }

  public async createSlide(slide: Omit<HomepageSlide, 'id' | 'created_at'>): Promise<HomepageSlide> {
    const newSlide: HomepageSlide = {
      ...slide,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.inMemory.homepage_slides.push(newSlide);
    await this.persist();
    return newSlide;
  }

  public async updateSlide(id: string, updates: Partial<Omit<HomepageSlide, 'id' | 'created_at'>>): Promise<HomepageSlide | null> {
    const idx = this.inMemory.homepage_slides.findIndex(s => s.id === id);
    if (idx === -1) return null;

    this.inMemory.homepage_slides[idx] = {
      ...this.inMemory.homepage_slides[idx],
      ...updates,
    };
    await this.persist();
    return this.inMemory.homepage_slides[idx];
  }

  public async deleteSlide(id: string): Promise<boolean> {
    const idx = this.inMemory.homepage_slides.findIndex(s => s.id === id);
    if (idx === -1) return false;

    this.inMemory.homepage_slides.splice(idx, 1);
    await this.persist();
    return true;
  }

  public async resetSlidesToDefault(): Promise<HomepageSlide[]> {
    this.inMemory.homepage_slides = [...DEFAULT_SLIDES];
    await this.persist();
    return [...this.inMemory.homepage_slides];
  }

  // --- HISTORY & INSPIRATION SECTIONS ---
  public getHistorySections(onlyPublished = false): HistorySection[] {
    let list = this.inMemory.history_sections || [];
    if (onlyPublished) {
      list = list.filter(s => s.is_published);
    }
    return [...list].sort((a, b) => a.order_num - b.order_num);
  }

  public getHistorySectionBySlug(slug: string): HistorySection | null {
    const item = (this.inMemory.history_sections || []).find(s => s.slug.toLowerCase() === slug.toLowerCase());
    return item || null;
  }

  public getHistorySectionById(id: string): HistorySection | null {
    const item = (this.inMemory.history_sections || []).find(s => s.id === id);
    return item || null;
  }

  public async updateHistorySection(id: string, updates: Partial<Omit<HistorySection, 'id' | 'slug'>>): Promise<HistorySection | null> {
    const idx = (this.inMemory.history_sections || []).findIndex(s => s.id === id);
    if (idx === -1) return null;

    this.inMemory.history_sections[idx] = {
      ...this.inMemory.history_sections[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.persist();
    return this.inMemory.history_sections[idx];
  }

  public async resetHistorySectionsToDefault(): Promise<HistorySection[]> {
    this.inMemory.history_sections = JSON.parse(JSON.stringify(DEFAULT_HISTORY_SECTIONS));
    await this.persist();
    return this.inMemory.history_sections;
  }

  // --- POST / CONTENT MANAGEMENT OPERATIONS ---
  public getPosts(onlyPublished = false, category?: string): Post[] {
    let list = this.inMemory.posts || [];
    if (onlyPublished) {
      list = list.filter(p => p.status === 'published');
    }
    if (category && category.trim() !== '' && category !== 'सभी' && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.trim().toLowerCase());
    }
    // Sort descending by published_at or created_at (latest first)
    return [...list].sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      return timeB - timeA;
    });
  }

  public getPostById(id: string): Post | null {
    const item = (this.inMemory.posts || []).find(p => p.id === id);
    return item || null;
  }

  public async createPost(data: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    if (!this.inMemory.posts) {
      this.inMemory.posts = [];
    }

    const newPost: Post = {
      ...data,
      id: `post-${uuidv4().slice(0, 8)}`,
      title: (data.title || '').trim(),
      title_color: data.title_color || '#0f172a',
      content: data.content || '',
      image_url: data.image_url || '',
      category: data.category || 'समाचार',
      status: data.status === 'draft' ? 'draft' : 'published',
      published_at: data.published_at || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_name: data.author_name || 'एडमिनिस्ट्रेटर',
    };

    this.inMemory.posts.unshift(newPost);
    await this.persist();
    return newPost;
  }

  public async updatePost(id: string, updates: Partial<Omit<Post, 'id' | 'created_at'>>): Promise<Post | null> {
    if (!this.inMemory.posts) return null;
    const idx = this.inMemory.posts.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const existing = this.inMemory.posts[idx];
    const updated: Post = {
      ...existing,
      ...updates,
      id: existing.id,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updated.title = updates.title.trim();
    if (updates.title_color !== undefined) updated.title_color = updates.title_color.trim();

    this.inMemory.posts[idx] = updated;
    await this.persist();
    return updated;
  }

  public async deletePost(id: string): Promise<boolean> {
    if (!this.inMemory.posts) return false;
    const idx = this.inMemory.posts.findIndex(p => p.id === id);
    if (idx === -1) return false;

    this.inMemory.posts.splice(idx, 1);
    await this.persist();
    return true;
  }

  public async resetPostsToDefault(): Promise<Post[]> {
    this.inMemory.posts = JSON.parse(JSON.stringify(DEFAULT_POSTS));
    await this.persist();
    return [...this.inMemory.posts];
  }
}

export const db = new Database();
