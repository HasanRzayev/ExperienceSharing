using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Mail;
using System.Net.Http;
using System.Text.Json;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ExperienceProject.Data;
using ExperienceProject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using BCrypt.Net;

namespace ExperienceProject.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwtHelper;
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, JwtHelper jwtHelper, IConfiguration configuration)
        {
            _context = context;
            _jwtHelper = jwtHelper;
            _configuration = configuration;

            Account account = new Account(
                "dj997ctyw",
                "278563758399669",
                "HliVZH4iQ8OjiZ_GptjlDeFuDxA");

            _cloudinary = new Cloudinary(account);
        }
        
        public async Task<(bool success, string token, string message)> RegisterAsync(
    string firstName, 
    string lastName, 
    string email, 
    string password, 
    string country, 
    IFormFile profileImage, 
    string userName) // Kullanıcı adı ekledik
{
    // Email kontrolü
    if (await _context.Users.AnyAsync(u => u.Email == email))
        return (false, null, "Email adresi zaten kayıtlı.");

    // Kullanıcı adı kontrolü
    if (await _context.Users.AnyAsync(u => u.UserName == userName))
        return (false, null, "Kullanıcı adı zaten alınmış.");

    // Şifre uzunluk kontrolü
    if (password.Length < 8)
        return (false, null, "Şifre en az 8 karakter uzunluğunda olmalıdır.");

            // Şifreyi BCrypt ilə hashleyelim
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

            // Profil resmi yükleme işlemi
            string profileImageUrl = null;
    if (profileImage != null)
    {
        using (var stream = profileImage.OpenReadStream())
        {
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(profileImage.FileName, stream),
                UseFilename = true,
                UniqueFilename = false,
                Overwrite = true
            };

            var uploadResult = _cloudinary.Upload(uploadParams);
            if (uploadResult.Error != null)
            {
                return (false, null, $"Resim yükleme hatası: {uploadResult.Error.Message}");
            }

            profileImageUrl = uploadResult.SecureUrl.ToString();
        }
    }

    // Yeni kullanıcı oluşturma
    var user = new User
    {
        FirstName = firstName,
        LastName = lastName,
        Email = email,
        PasswordHash = hashedPassword,

        Country = country,
        ProfileImage = profileImageUrl,
        UserName = userName
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    var token = _jwtHelper.GenerateJwtToken(user.Id, user.Email);
    return (true, token, "Kayıt başarılı.");
}


        public async Task<(bool success, string token, string message)> LoginAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return (false, null, "Email və ya şifrə yanlışdır.");

            // Google OAuth user-ləri üçün yoxlama
            if (user.GoogleId != null && string.IsNullOrEmpty(user.PasswordHash))
                return (false, null, "Bu hesab Google ilə yaradılıb. Google ilə daxil olun.");

            // Password verify - Həm BCrypt həm də SHA256 dəstəkləyirik
            bool isPasswordValid = false;
            
            try
            {
                // Əvvəlcə BCrypt yoxlayaq (əksər database-lər BCrypt istifadə edir)
                isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            }
            catch
            {
                // BCrypt işləməzsə, SHA256 yoxlayaq (yeni sistem)
                isPasswordValid = user.PasswordHash == HashPassword(password);
            }

            if (!isPasswordValid)
                return (false, null, "Email və ya şifrə yanlışdır.");

            var token = _jwtHelper.GenerateJwtToken(user.Id, user.Email);
            return (true, token, "Giriş uğurlu oldu.");
        }

        // Forgot Password - Generate Reset Token
        public async Task<(bool success, string token, string message)> GeneratePasswordResetTokenAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return (false, null, "Bu email adresi ilə istifadəçi tapılmadı.");

            // Reset token yaradırıq (JWT istifadə edərək, 1 saat etibarlı)
            var resetToken = _jwtHelper.GenerateJwtToken(user.Id, user.Email, expirationMinutes: 60);

            return (true, resetToken, "Reset linki yaradıldı.");
        }

        // Reset Password with Token
        public async Task<(bool success, string message)> ResetPasswordWithTokenAsync(string token, string newPassword)
        {
            try
            {
                // Token-ı validate et
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;

                if (emailClaim == null)
                    return (false, "Token etibarsızdır.");

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim);
                if (user == null)
                    return (false, "İstifadəçi tapılmadı.");

                // Şifre uzunluk kontrolü
                if (newPassword.Length < 8)
                    return (false, "Şifre ən azı 8 simvoldan ibarət olmalıdır.");

                // Yeni şifrəni BCrypt ilə hash-lə və yenilə
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
                await _context.SaveChangesAsync();

                return (true, "Şifrə uğurla yeniləndi.");
            }
            catch (Exception ex)
            {
                return (false, "Token etibarsızdır və ya vaxtı keçmişdir.");
            }
        }

        // Email göndərmə funksiyası
        public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
        {
            // SMTP konfiqurasiyası - əvvəl environment variables, sonra appsettings-dən oxu
            var smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") 
                ?? _configuration["EmailSettings:SmtpHost"] 
                ?? "smtp.gmail.com";
            
            var smtpPortStr = Environment.GetEnvironmentVariable("SMTP_PORT") 
                ?? _configuration["EmailSettings:SmtpPort"]?.ToString() 
                ?? "587";
            var smtpPort = int.Parse(smtpPortStr);
            
            var smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") 
                ?? _configuration["EmailSettings:Username"];
            
            var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") 
                ?? _configuration["EmailSettings:Password"];
            
            var fromEmail = Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") 
                ?? _configuration["EmailSettings:FromEmail"] 
                ?? smtpUsername;

            if (string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
            {
                throw new Exception("SMTP konfiqurasiyası tapılmadı. Environment variables və ya appsettings.json-da EmailSettings təyin edin.");
            }

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, "Experience Sharing"),
                Subject = "Şifrə Sıfırlama Linki",
                Body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                            <h2 style='color: #7C3AED; border-bottom: 3px solid #7C3AED; padding-bottom: 10px;'>
                                Şifrə Sıfırlama Tələbi
                            </h2>
                            <p>Salam,</p>
                            <p>Hesabınız üçün şifrə sıfırlama tələbi aldıq. Şifrənizi sıfırlamaq üçün aşağıdakı linkə tıklayın:</p>
                            
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{resetLink}' 
                                   style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                          color: white; 
                                          padding: 15px 30px; 
                                          text-decoration: none; 
                                          border-radius: 8px; 
                                          font-weight: bold;
                                          display: inline-block;'>
                                    Şifrəni Sıfırla
                                </a>
                            </div>
                            
                            <p style='color: #666; font-size: 14px;'>
                                Bu link 1 saat ərzində etibarlıdır.
                            </p>
                            
                            <p style='color: #666; font-size: 14px;'>
                                Əgər bu tələbi siz göndərməmisinizsə, bu emaili nəzərə almayın.
                            </p>
                            
                            <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                            
                            <p style='color: #999; font-size: 12px; text-align: center;'>
                                © 2025 Experience Sharing. Bütün hüquqlar qorunur.
                            </p>
                        </div>
                    </body>
                    </html>
                ",
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            using (var smtpClient = new SmtpClient(smtpHost, smtpPort))
            {
                smtpClient.EnableSsl = true;
                smtpClient.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
                await smtpClient.SendMailAsync(mailMessage);
            }
        }

        // Google OAuth Login
        public async Task<(bool success, string token, string message)> GoogleLoginAsync(string googleToken)
        {
            try
            {
                // Google token-i verify et
                var googleUser = await VerifyGoogleTokenAsync(googleToken);
                
                if (googleUser == null)
                {
                    return (false, null, "Google token-i etibarsızdır.");
                }

                // İstifadəçini database-də tap və ya yarat
                var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleUser.GoogleId || u.Email == googleUser.Email);

                if (user == null)
                {
                    // Yeni istifadəçi yarat
                    user = new User
                    {
                        GoogleId = googleUser.GoogleId,
                        Email = googleUser.Email,
                        FirstName = googleUser.FirstName,
                        LastName = googleUser.LastName,
                        UserName = googleUser.Email.Split('@')[0], // Email-dən username yarat
                        Country = "Azerbaijan", // Default
                        ProfileImage = googleUser.ProfilePicture,
                        PasswordHash = null // Google OAuth üçün parol lazım deyil
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Mövcud istifadəçini yenilə (GoogleId və ProfileImage)
                    if (string.IsNullOrEmpty(user.GoogleId))
                    {
                        user.GoogleId = googleUser.GoogleId;
                    }
                    
                    if (!string.IsNullOrEmpty(googleUser.ProfilePicture))
                    {
                        user.ProfileImage = googleUser.ProfilePicture;
                    }
                    
                    await _context.SaveChangesAsync();
                }

                // JWT token yarat
                var token = _jwtHelper.GenerateJwtToken(user.Id, user.Email);
                return (true, token, "Google ilə giriş uğurlu oldu!");
            }
            catch (Exception ex)
            {
                return (false, null, $"Google giriş xətası: {ex.Message}");
            }
        }

        // Google Token Verify
        private async Task<GoogleUserInfo> VerifyGoogleTokenAsync(string googleToken)
        {
            try
            {
                using var httpClient = new HttpClient();
                var response = await httpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={googleToken}");
                
                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                var tokenInfo = JsonSerializer.Deserialize<JsonElement>(content);

                return new GoogleUserInfo
                {
                    GoogleId = tokenInfo.GetProperty("sub").GetString(),
                    Email = tokenInfo.GetProperty("email").GetString(),
                    FirstName = tokenInfo.TryGetProperty("given_name", out var firstName) ? firstName.GetString() : "",
                    LastName = tokenInfo.TryGetProperty("family_name", out var lastName) ? lastName.GetString() : "",
                    ProfilePicture = tokenInfo.TryGetProperty("picture", out var picture) ? picture.GetString() : null
                };
            }
            catch
            {
                return null;
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
      

        private bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt)
        {
            using (var hmac = new HMACSHA512(storedSalt))
            {
                byte[] computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(storedHash);
            }
        }
    }

    // Google User Info helper class
    public class GoogleUserInfo
    {
        public string GoogleId { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ProfilePicture { get; set; }
    }
}
