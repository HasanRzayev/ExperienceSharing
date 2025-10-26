using ExperienceProject.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.Tasks;
using ExperienceProject.Services;
using Microsoft.AspNetCore.Http.Features;
using Newtonsoft.Json;
using ExperienceProject.Hubs;
using Experience.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Configure port from environment variable (for deployment)
// Development: launchSettings.json-dakı portdan istifadə edəcəyik
// var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
// builder.WebHost.UseUrls($"http://*:{port}");

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Controllers with Newtonsoft.Json for better reference handling
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        options.SerializerSettings.Formatting = Formatting.Indented;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add AuthService and JwtHelper to DI container
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtHelper>();

// Add HTTP Client and AI Recommendation Service
builder.Services.AddHttpClient();
builder.Services.AddScoped<AIRecommendationService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        // Çoklu issuer/audience kabul et
        ValidIssuers = new[]
        {
            jwtSettings["Issuer"],
            "https://experiencesharingbackend.runasp.net"
        },
        ValidAudiences = new[]
        {
            jwtSettings["Audience"],
            "https://experiencesharingbackend.runasp.net"
        },
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.FromMinutes(3)
    };
});

builder.Services.AddHttpContextAccessor();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:3000",
                    "https://localhost:3000",
                    "https://experience-sharing.vercel.app",
                    "https://experiencesharingbackend.runasp.net"
                   )
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials()
                   .SetIsOriginAllowedToAllowWildcardSubdomains();
        });
});

// Configure file upload limits
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB
});

// Add SignalR with detailed errors
builder.Services.AddSignalR(opt =>
{
    opt.EnableDetailedErrors = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Note: For production, consider disabling HTTPS redirection if behind a proxy
// app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseRouting();

// Use CORS policy - MUST come after UseRouting and before UseAuthentication
app.UseCors("AllowSpecificOrigin");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers and Hubs
app.MapControllers();
app.MapHub<MessageHub>("api/hubs/message");
app.MapHub<DeviceLinkHub>("api/deviceLinkHub");

// Ensure database migrations are applied (with error handling)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        try
        {
            // Apply migrations
            await dbContext.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully.");

            // Seed default users and experiences
            await SeedData.InitializeAsync(services);
            logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating or seeding the database.");
            // Don't throw - allow app to start even if seeding fails
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Error during database initialization: {ex.Message}");
    // Continue app startup
}

app.Run();
