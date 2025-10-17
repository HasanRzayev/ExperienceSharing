-- Bütün user-lərin password-larını "test12345" olaraq təyin et (BCrypt hash)
-- BCrypt hash for "test12345": $2a$11$xnXVZ5mKjYvVxVXvXvXvXeXvXvXvXvXvXvXvXvXvXvXvXvXvXvXvXv

-- Siz bu SQL-i işlətməzdən əvvəl, aşağıdakı C# console app-i işlədin və BCrypt hash alın:
-- Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("test12345"));

-- Sonra bu SQL-i işlədin (hash-i dəyişdirin):
-- UPDATE Users 
-- SET PasswordHash = '$2a$11$...' 
-- WHERE GoogleId IS NULL OR GoogleId = '';

-- QEYD: Bu sadəcə development üçündür! Production-da HEÇ VAXT belə etməyin!

