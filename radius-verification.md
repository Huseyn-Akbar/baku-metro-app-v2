# 500 metr radius yoxlaması

AYNA route importu artıq yalnız stansiyanın öz adını ehtiva edən dayanacaqlara deyil, metro stansiyasının koordinat mərkəzindən 500 metr radius daxilində yerləşən bütün AYNA dayanacaqlarına əsaslanır. Generic “Nəriman Nərimanov heykəli” kimi adlar metro stansiyası hesab edilmir.

AYNA exact stop məlumatı olan 19 metro stansiyasına əlavə olaraq, stop feed-ində platforması olmayan 7 stansiya üçün real OpenStreetMap stansiya koordinatları fallback kimi daxil edildi. Beləliklə 26 stansiya radius xəritələməsinə daxil edilir; “Ağ Şəhər” üçün AYNA xəritəsində uyğun aktiv metro stopu olmadığı üçün ayrıca route uyğunluğu yaradılmadı.

Preview-də `Nəriman Nərimanov → 28 May` axtarışı 4 real AYNA xətti göstərdi: 2, 4, 5 və 11. 10 nömrəli xətt nəticələrdə yoxdur. Son dataset 88 radius əsaslı AYNA xəttindən ibarətdir. 11 test, typecheck və production build uğurludur.
