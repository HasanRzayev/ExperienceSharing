# DROP vs TRUNCATE vs DELETE

## db28857-drop-tables.sql
**DROP TABLE** - Tablolari tamamen sil
- Tablo structure silinir
- Application restart sonra migrationlar yeniden olusturur
- Seed data yuklenir

## db28857-truncate-all.sql  
**TRUNCATE TABLE** - Tablolardaki datani sil, structure sakla
- Tablo structure kalir
- Daha hizli
- Application restart sonra seed data yuklenir

## db28857-basit.sql
**DELETE** - Sadece datani sil
- Tablo structure kalir
- Yavas
- Application restart sonra seed data yuklenir

---

## Hangi birini secmeli?

**Tavsiye**: `db28857-truncate-all.sql`
- Hizli
- Guvenli
- Structure korunur
- Seed data isler

