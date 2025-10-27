const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 راه‌اندازی تمام سرویس‌ها...\n');

// رنگ‌ها برای کنسول
const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const magenta = '\x1b[35m';
const reset = '\x1b[0m';

// اجرای Next.js app
console.log('📱 راه‌اندازی Next.js app...');
const nextApp = spawn('npm', ['run', 'app:start'], { 
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

nextApp.stdout.on('data', (data) => {
  console.log(`${blue}[NEXT-APP]${reset} ${data.toString().trim()}`);
});

nextApp.stderr.on('data', (data) => {
  console.log(`${red}[NEXT-APP ERROR]${reset} ${data.toString().trim()}`);
});

// صبر کردن 3 ثانیه
setTimeout(() => {
  // اجرای ربات تلگرام
  console.log('🤖 راه‌اندازی ربات تلگرام...');
  const telegramBot = spawn('npm', ['start'], { 
    cwd: path.join(__dirname, 'bot'),
    stdio: 'pipe',
    shell: true
  });

  telegramBot.stdout.on('data', (data) => {
    console.log(`${green}[TELEGRAM-BOT]${reset} ${data.toString().trim()}`);
  });

  telegramBot.stderr.on('data', (data) => {
    console.log(`${red}[TELEGRAM-BOT ERROR]${reset} ${data.toString().trim()}`);
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
    
    console.log('\n✅ تمام سرویس‌ها راه‌اندازی شدند!');
    console.log('📱 Next.js App: http://localhost:6592');
    console.log('🤖 ربات تلگرام: فعال');
    console.log('📊 ربات گزارشگر: فعال\n');
    
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
