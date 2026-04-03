require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Article = require("../models/Article");

const sl = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\u0111/g,"d").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-") + "-" + (Date.now()%9999);

const DATA = [
  ["Danh gia iPhone 17 Pro Max: Chip A19 Pro manh nhat","Danh gia","iPhone 17 Pro Max chip A19 Pro hieu nang dot pha.",["/iphone-17-pro_1.webp","/iphone-17-pro_2.webp","/iphone-17-pro_3.webp"],true,"Dang Anh","8 phut doc","2026-03-24","<p>iPhone 17 Pro Max flagship manh nhat Apple 2026.</p><figure><img src='/iphone-17-pro_2.webp'/><figcaption>Thiet ke titan</figcaption></figure><ul><li>Camera 48MP f/1.78</li><li>Telephoto 12MP zoom 5x</li><li>Pin 4685mAh</li></ul>"],
  ["Top 5 laptop gaming tot nhat 2026","Thu thuat","5 mau laptop gaming dang mua nhat 2026.",["/asus-tuf-gaming-a15-1.webp","/asus-tuf-gaming-a15-2.webp","/asus-tuf-gaming-f16-1.webp"],false,"Minh Tuan","10 phut doc","2026-03-23","<p>Laptop gaming 2026 soi dong.</p><figure><img src='/asus-tuf-gaming-a15-2.webp'/><figcaption>ASUS TUF A15</figcaption></figure><ul><li>ASUS TUF A15: Ryzen 7, RTX 4060</li><li>ASUS TUF F16: i7, RTX 4070</li></ul>"],
  ["Mo hop MacBook Pro M5 pin 22 gio","Mo hop","MacBook Pro M5 chip M5 va pin 22 gio.",["/apple-macbook-m5-1.webp","/apple-macbook-m5-2.png","/apple-macbook-m5-3.png"],false,"Jay Nguyen","6 phut doc","2026-03-23","<p>MacBook Pro M5 gia 46.990.000d.</p><figure><img src='/apple-macbook-m5-2.png'/><figcaption>Mo hop</figcaption></figure><p>Chip M5 10 nhan CPU, pin 22 gio.</p>"],
  ["Samsung Galaxy Z Fold 7 man hinh gap 7.6 inch","Tin tuc","Galaxy Z Fold 7 thiet ke mong hon.",["/samsung-galaxy-z-fold-7-1.webp","/samsung-galaxy-z-fold-7-2.jpg","/samsung-galaxy-z-fold-7-3.webp"],false,"Minh Tuan","5 phut doc","2026-03-24","<p>Samsung ra mat Z Fold 7.</p><figure><img src='/samsung-galaxy-z-fold-7-2.jpg'/><figcaption>Z Fold 7</figcaption></figure><ul><li>Man hinh 7.6 inch AMOLED 120Hz</li><li>Snapdragon 8 Elite</li></ul>"],
  ["5 meo tang toc Android khong can root","Thu thuat","5 meo tang toc Android don gian.",["/samsung-galaxy-s26-ultra-1.webp","/samsung-galaxy-s26-ultra-2.webp"],false,"Hai Tran","5 phut doc","2026-03-22","<p>Android chay cham do cache.</p><ol><li>Xoa cache ung dung</li><li>Tat animation</li><li>Han che app chay nen</li><li>Don dep bo nho</li><li>Khoi dong lai dinh ky</li></ol>"],
  ["Can canh Apple Watch Ultra 2 pin 60 gio","Can canh","Apple Watch Ultra 2 titan, pin 60 gio.",["/apple-watch-ultra-1.webp","/apple-watch-ultra-2.webp","/apple-watch-ultra-3.webp"],false,"Hai Tran","4 phut doc","2026-03-23","<p>Apple Watch Ultra 2 cao cap nhat.</p><figure><img src='/apple-watch-ultra-2.webp'/><figcaption>Ultra 2</figcaption></figure><ul><li>Vo titan 49mm</li><li>Pin 60 gio</li><li>GPS L1+L2</li></ul>"],
  ["So sanh iPhone 17 vs Samsung Galaxy S26","Danh gia","Cuoc chien flagship 2026.",["/iphone-17_1.webp","/samsung-galaxy-s26-1.webp","/iphone-17_2.webp"],false,"Dang Anh","12 phut doc","2026-03-21","<p>Doi dau 2026.</p><figure><img src='/samsung-galaxy-s26-1.webp'/><figcaption>Galaxy S26</figcaption></figure><ul><li>iPhone 17: A19, 8GB, iOS 19</li><li>Galaxy S26: SD 8 Elite Gen2, 12GB</li></ul>"],
  ["Huawei Watch GT 10 pin 14 ngay AI","Tin tuc","Huawei Watch GT 10 pin 14 ngay.",["/huawai-watch-gt-10-1.webp","/huawai-watch-gt-10-2.webp","/huawai-watch-gt-10-3.webp"],false,"Minh Tuan","4 phut doc","2026-03-22","<p>Huawei Watch GT 10 gia 6.490.000d.</p><figure><img src='/huawai-watch-gt-10-2.webp'/><figcaption>GT 10</figcaption></figure><ul><li>Pin 14 ngay</li><li>AMOLED 1.43 inch</li><li>SpO2, ECG, GPS</li></ul>"],
  ["Xiaomi 15 Ultra camera Leica 200MP sac 90W","Danh gia","Xiaomi 15 Ultra Leica 200MP, sac 90W.",["/xiaomi-15-ultra-1.webp","/xiaomi-15-ultra-2.webp","/xiaomi-15-ultra-3.webp"],false,"Dang Anh","7 phut doc","2026-03-20","<p>Xiaomi 15 Ultra flagship 2026.</p><figure><img src='/xiaomi-15-ultra-2.webp'/><figcaption>Camera Leica</figcaption></figure><ul><li>Camera 200MP f/1.63</li><li>Telephoto 50MP zoom 5x</li><li>Pin 5500mAh sac 90W</li></ul>"],
];

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 }).then(async () => {
  console.log("Connected");
  await Article.deleteMany({});
  console.log("Cleared");
  for (const [title,cat,ex,imgs,feat,auth,rt,d,content] of DATA) {
    await Article.create({ title, slug: sl(title), category: cat, excerpt: ex, content, img: imgs[0], images: imgs, mainImageIndex: 0, author: auth, featured: feat, published: true, readTime: rt, createdAt: new Date(d) });
    console.log("OK:", title.slice(0,40));
  }
  console.log("Done:", DATA.length);
  await mongoose.disconnect();
}).catch(e => { console.error("ERR:", e.message); process.exit(1); });
