const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 راه‌اندازی تمام سرویس‌ها در حالت Development...\n');

// رنگ‌ها برای کنسول
const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const magenta = '\x1b[35m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

// اجرای Next.js app در حالت dev
console.log('📱 راه‌اندازی Next.js app (Development Mode)...');
const nextApp = spawn('npm', ['run', 'app:dev'], { 
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

nextApp.stdout.on('data', (data) => {
  console.log(`${blue}[NEXT-DEV]${reset} ${data.toString().trim()}`);
});

nextApp.stderr.on('data', (data) => {
  console.log(`${red}[NEXT-DEV ERROR]${reset} ${data.toString().trim()}`);
});

// صبر کردن 3 ثانیه
setTimeout(() => {
  // اجرای ربات تلگرام در حالت dev
  console.log('🤖 راه‌اندازی ربات تلگرام (Development Mode)...');
  const telegramBot = spawn('npm', ['run', 'dev'], { 
    cwd: path.join(__dirname, 'bot'),
    stdio: 'pipe',
    shell: true
  });

  telegramBot.stdout.on('data', (data) => {
    console.log(`${green}[TELEGRAM-DEV]${reset} ${data.toString().trim()}`);
  });

  telegramBot.stderr.on('data', (data) => {
    console.log(`${red}[TELEGRAM-DEV ERROR]${reset} ${data.toString().trim()}`);
  });
  
  // صبر کردن 2 ثانیه
  setTimeout(() => {
    // اجرای ربات گزارشگر
    console.log('📊 راه‌اندازی ربات گزارشگر...');
    const purchaseReporter = spawn('node', ['purchase-reporter.js'], { 
      cwd: path.join(__dirname, 'bot'),
      stdio: 'pipe',
      shell: true
    });

    purchaseReporter.stdout.on('data', (data) => {
      console.log(`${magenta}[REPORTER]${reset} ${data.toString().trim()}`);
    });

    purchaseReporter.stderr.on('data', (data) => {
      console.log(`${red}[REPORTER ERROR]${reset} ${data.toString().trim()}`);
    });
    
    console.log('\n✅ تمام سرویس‌ها در حالت Development راه‌اندازی شدند!');
    console.log('📱 Next.js App: http://localhost:6592 (Hot Reload فعال)');
    console.log('🤖 ربات تلگرام: فعال (Auto Restart فعال)');
    console.log('📊 ربات گزارشگر: فعال\n');
    console.log(`${yellow}💡 نکته: Next.js و ربات تلگرام با تغییرات فایل‌ها خودکار restart می‌شوند${reset}\n`);
    
    // مدیریت خروج
    process.on('SIGINT', () => {
      console.log('\n🛑 خاموش کردن تمام سرویس‌ها...');
      nextApp.kill();
      telegramBot.kill();
      purchaseReporter.kill();
      process.exit(0);
    });
    
  }, 2000);
}, 3000);
