ROLLBACK R4 -> R3 QA FIXED

מטרת החבילה: להחזיר את ששת קבצי R4 לגרסת R3 QA Fixed היציבה.
יש למזג את התיקיות components, lib, pages עם שורש הריפו ולהחליף את הקבצים הקיימים.
הקובץ lib/studio/goldenPath.js יכול להישאר בריפו; לאחר החזרה הוא אינו מיובא ואינו פעיל.

Commit מומלץ:
Rollback unstable R4 golden path to R3 stable
