interface VirtualNumberResponse {
  number: string;
  request_id: number;
  price: number;
  country: string;
  range: number;
  service: string;
  quality: string;
}

interface PriceResponse {
  country: string;
  range: number;
  price: number;
  count: string;
}

// interface VirtualNumberRequest {
//   serviceId: number;
//   country: string;
//   token: string;
// }

export class VirtualNumberService {
  private static readonly API_BASE_URL = 'https://api.ozvinoo.xyz/web';
  private static readonly TOKEN = '221898889:p55zM1yb4061933WDQXB6KaFCDAQSdh4yaEW6521EJJ1';

  /**
   * دریافت شماره مجازی از API خارجی
   */
  static async getVirtualNumber(serviceId: number, country: string): Promise<VirtualNumberResponse> {
    const url = `${this.API_BASE_URL}/${this.TOKEN}/getNumber/${serviceId}/${encodeURIComponent(country)}`;
    
    console.log('🌐 Calling external API:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('توکن احراز هویت نامعتبر است');
        } else if (response.status === 404) {
          throw new Error('سرویس یا کشور مورد نظر یافت نشد');
        } else if (response.status === 500) {
          throw new Error('خطای داخلی سرور سرویس دهنده');
        } else {
          throw new Error(`خطا در دریافت شماره مجازی: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      
      // بررسی موفقیت‌آمیز بودن پاسخ
      if (data.success === false) {
        throw new Error(data.error_msg || 'خطا در دریافت شماره مجازی');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Network Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('خطا در ارتباط با سرور خارجی');
    }
  }

  /**
   * دریافت لیست قیمت‌ها از API خارجی
   */
  static async getPrices(serviceId: number): Promise<PriceResponse[]> {
    const url = `${this.API_BASE_URL}/${this.TOKEN}/get-prices/${serviceId}`;
    
    console.log('🌐 Calling prices API:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('توکن احراز هویت نامعتبر است');
        } else if (response.status === 404) {
          throw new Error('سرویس مورد نظر یافت نشد');
        } else if (response.status === 500) {
          throw new Error('خطای داخلی سرور سرویس دهنده');
        } else {
          throw new Error(`خطا در دریافت قیمت‌ها: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('✅ Prices API Response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Network Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('خطا در ارتباط با سرور خارجی');
    }
  }

  /**
   * تبدیل نام کشور به کد کشور برای API
   */
  static getCountryCode(countryName: string): string {
    // پاک کردن فضاهای اضافی و تبدیل به حروف کوچک برای مقایسه بهتر
    const cleanName = countryName.trim().toLowerCase();
    
    // مپینگ نام کشورها به کدهایشان (با پشتیبانی از نام‌های مختلف)
    const countryMapping: { [key: string]: string } = {
      // آمریکای شمالی
      'آمریکا': '1', 'usa': '1', 'united states': '1', 'us': '1',
      'کانادا': '1', 'canada': '1',
      
      // اروپا
      'انگلستان': '44', 'uk': '44', 'united kingdom': '44', 'britain': '44',
      'آلمان': '49', 'germany': '49', 'deutschland': '49',
      'فرانسه': '33', 'france': '33',
      'ایتالیا': '39', 'italy': '39',
      'اسپانیا': '34', 'spain': '34', 'españa': '34',
      'هلند': '31', 'netherlands': '31', 'holland': '31',
      'بلژیک': '32', 'belgium': '32',
      'سوئیس': '41', 'switzerland': '41',
      'اتریش': '43', 'austria': '43',
      'سوئد': '46', 'sweden': '46',
      'نروژ': '47', 'norway': '47',
      'دانمارک': '45', 'denmark': '45',
      'فنلاند': '358', 'finland': '358',
      'لهستان': '48', 'poland': '48',
      'چک': '420', 'czech republic': '420', 'czechia': '420',
      'مجارستان': '36', 'hungary': '36',
      'رومانی': '40', 'romania': '40',
      'بلغارستان': '359', 'bulgaria': '359',
      'کرواسی': '385', 'croatia': '385',
      'اسلواکی': '421', 'slovakia': '421',
      'اسلوونی': '386', 'slovenia': '386',
      'لیتوانی': '370', 'lithuania': '370',
      'لتونی': '371', 'latvia': '371',
      'استونی': '372', 'estonia': '372',
      'یونان': '30', 'greece': '30',
      'پرتغال': '351', 'portugal': '351',
      'ایرلند': '353', 'ireland': '353',
      'لوکزامبورگ': '352', 'luxembourg': '352',
      'مالت': '356', 'malta': '356',
      'قبرس': '357', 'cyprus': '357',
      
      // آسیا
      'ژاپن': '81', 'japan': '81',
      'کره جنوبی': '82', 'south korea': '82', 'korea': '82',
      'چین': '86', 'china': '86',
      'هند': '91', 'india': '91',
      'بنگلادش': '880', 'bangladesh': '880',
      'پاکستان': '92', 'pakistan': '92',
      'نپال': '977', 'nepal': '977',
      'سری‌لانکا': '94', 'sri lanka': '94',
      'میانمار': '95', 'myanmar': '95', 'burma': '95',
      'تایلند': '66', 'thailand': '66',
      'ویتنام': '84', 'vietnam': '84',
      'کامبوج': '855', 'cambodia': '855',
      'لائوس': '856', 'laos': '856',
      'فیلیپین': '63', 'philippines': '63',
      'اندونزی': '62', 'indonesia': '62',
      'مالزی': '60', 'malaysia': '60',
      'سنگاپور': '65', 'singapore': '65',
      'برونئی': '673', 'brunei': '673',
      'تیمور شرقی': '670', 'east timor': '670',
      
      // خاورمیانه
      'ایران': '98', 'iran': '98',
      'عربستان سعودی': '966', 'saudi arabia': '966',
      'امارات متحده عربی': '971', 'uae': '971', 'united arab emirates': '971',
      'قطر': '974', 'qatar': '974',
      'کویت': '965', 'kuwait': '965',
      'بحرین': '973', 'bahrain': '973',
      'عمان': '968', 'oman': '968',
      'اردن': '962', 'jordan': '962',
      'لبنان': '961', 'lebanon': '961',
      'سوریه': '963', 'syria': '963',
      'عراق': '964', 'iraq': '964',
      'ترکیه': '90', 'turkey': '90',
      
      // آفریقا
      'مصر': '20', 'egypt': '20',
      'مراکش': '212', 'morocco': '212',
      'تونس': '216', 'tunisia': '216',
      'الجزایر': '213', 'algeria': '213',
      'لیبی': '218', 'libya': '218',
      'سودان': '249', 'sudan': '249',
      'اتیوپی': '251', 'ethiopia': '251',
      'کنیا': '254', 'kenya': '254',
      'نیجریه': '234', 'nigeria': '234',
      'آفریقای جنوبی': '27', 'south africa': '27',
      'غنا': '233', 'ghana': '233',
      'سنگال': '221', 'senegal': '221',
      'مالی': '223', 'mali': '223',
      'بورکینافاسو': '226', 'burkina faso': '226',
      'ساحل عاج': '225', 'ivory coast': '225', 'côte d\'ivoire': '225',
      'گینه': '224', 'guinea': '224',
      'سیرالئون': '232', 'sierra leone': '232',
      'لیبریا': '231', 'liberia': '231',
      'گامبیا': '220', 'gambia': '220',
      'گینه بیسائو': '245', 'guinea-bissau': '245',
      'کیپ ورد': '238', 'cape verde': '238',
      'سائوتومه و پرنسیپ': '239', 'são tomé and príncipe': '239',
      'گابن': '241', 'gabon': '241',
      'کامرون': '237', 'cameroon': '237',
      'چاد': '235', 'chad': '235',
      'جمهوری آفریقای مرکزی': '236', 'central african republic': '236',
      'کنگو': '242', 'congo': '242',
      'جمهوری دموکراتیک کنگو': '243', 'democratic republic of congo': '243', 'drc': '243',
      'آنگولا': '244', 'angola': '244',
      'زامبیا': '260', 'zambia': '260',
      'زیمبابوه': '263', 'zimbabwe': '263',
      'بوتسوانا': '267', 'botswana': '267',
      'نامیبیا': '264', 'namibia': '264',
      'لسوتو': '266', 'lesotho': '266',
      'سوازیلند': '268', 'eswatini': '268', 'swaziland': '268',
      'ماداگاسکار': '261', 'madagascar': '261',
      'موریس': '230', 'mauritius': '230',
      'سیشل': '248', 'seychelles': '248',
      'کومور': '269', 'comoros': '269',
      'جیبوتی': '253', 'djibouti': '253',
      'اریتره': '291', 'eritrea': '291',
      'سومالی': '252', 'somalia': '252',
      'اوگاندا': '256', 'uganda': '256',
      'تانزانیا': '255', 'tanzania': '255',
      'روآندا': '250', 'rwanda': '250',
      'بوروندی': '257', 'burundi': '257',
      'مالاوی': '265', 'malawi': '265',
      'موزامبیک': '258', 'mozambique': '258',
      
      // آمریکای جنوبی
      'برزیل': '55', 'brazil': '55',
      'آرژانتین': '54', 'argentina': '54',
      'مکزیک': '52', 'mexico': '52',
      
      // اقیانوسیه
      'استرالیا': '61', 'australia': '61',
      'نیوزیلند': '64', 'new zealand': '64',
      
      // اروپای شرقی
      'روسیه': '7', 'russia': '7'
    };

    // جستجو در مپینگ (ابتدا با نام اصلی)
    let countryCode = countryMapping[countryName];
    if (countryCode) {
      console.log(`✅ Found country code for "${countryName}": ${countryCode}`);
      return countryCode;
    }

    // جستجو با نام پاک شده
    countryCode = countryMapping[cleanName];
    if (countryCode) {
      console.log(`✅ Found country code for "${cleanName}": ${countryCode}`);
      return countryCode;
    }

    // جستجوی جزئی (برای نام‌های ترکیبی)
    for (const [key, value] of Object.entries(countryMapping)) {
      if (cleanName.includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName)) {
        console.log(`✅ Found partial match for "${countryName}": ${key} -> ${value}`);
        return value;
      }
    }

    // اگر پیدا نشد، خود نام کشور را برگردان
    console.warn(`⚠️ Country code not found for: "${countryName}", using country name as is`);
    return countryName;
  }
}
