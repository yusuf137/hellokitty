# Aşkıma Giden Yol

Next.js App Router, TypeScript ve Phaser 3 ile hazırlanmış üç bölümlük doğum günü oyunu.

## Çalıştırma

Node.js 22 LTS ile proje klasöründe `npm ci` ve `npm run dev` komutlarını çalıştırın. Oyunu http://localhost:3000 adresinde açın. Üretim sürümü için `npm run build`, ardından `npm start` kullanın.

## Kişiselleştirme

`game/config.ts` dosyasında bölüm adlarını, anı mesajlarını, fotoğraf yollarını ve final başlığını düzenleyebilirsiniz. Fotoğraflarınızı varsayılan olarak `public/memories/1.jpg`, `2.jpg` ve `3.jpg` adlarıyla ekleyin. Fotoğraf bulunamadığında piksel bahçesi görünür.

Masaüstünde ok tuşları veya A/D ile yürüyün. Space, W veya yukarı ok ile zıplayın. Dokunmatik ekranda yürürken diğer parmağınızla zıplayabilirsiniz. Bayraklar yeniden doğma noktasını değiştirir. Sayfayı yenilemek macerayı sıfırlar.

## Vercel

Proje klasörünü bir Git deposuna ekleyip Vercel üzerinden içe aktarın. Framework olarak Next.js ve derleme komutu olarak `npm run build` seçin. Ortam değişkeni gerekmez.
