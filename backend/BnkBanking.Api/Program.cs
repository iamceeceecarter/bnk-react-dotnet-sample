using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHealthChecks();

// CORS for local dev + production web origin (set via config)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("web", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Basic, safe rate limiting for public endpoints
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.PermitLimit = 60;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

var app = builder.Build();

// --- Middleware ---
app.UseHttpsRedirection();
app.UseCors("web");
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- Fake in-memory data store (swap with real DB later) ---
var accounts = new List<AccountDto>
{
    new("1001", "Everyday Checking", "Checking", 2543.12m),
    new("2001", "Rainy Day Savings", "Savings", 10500.00m),
    new("3001", "Rewards Credit", "Credit", -412.55m)
};

// --- Endpoints ---
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .WithName("Health")
   .WithTags("Ops")
   .RequireRateLimiting("fixed");

app.MapHealthChecks("/healthz");

app.MapGet("/api/accounts", () => Results.Ok(accounts))
   .WithName("GetAccounts")
   .WithTags("Accounts")
   .RequireRateLimiting("fixed");

app.MapPost("/api/transfers", (TransferRequest req) =>
{
    // Server-side validation (banking-style): never trust client
    if (req.Amount <= 0) return Results.BadRequest(new { errorCode = "INVALID_AMOUNT", message = "Amount must be greater than 0." });
    if (req.FromAccountId == req.ToAccountId) return Results.BadRequest(new { errorCode = "SAME_ACCOUNT", message = "From/To accounts must be different." });

    var from = accounts.FirstOrDefault(a => a.Id == req.FromAccountId);
    var to = accounts.FirstOrDefault(a => a.Id == req.ToAccountId);

    if (from is null || to is null)
        return Results.BadRequest(new { errorCode = "ACCOUNT_NOT_FOUND", message = "One or more accounts do not exist." });

    if (from.Balance < req.Amount)
        return Results.BadRequest(new { errorCode = "INSUFFICIENT_FUNDS", message = "Insufficient funds." });

    // Apply transfer (demo only)
    accounts = accounts.Select(a =>
    {
        if (a.Id == from.Id) return a with { Balance = a.Balance - req.Amount };
        if (a.Id == to.Id) return a with { Balance = a.Balance + req.Amount };
        return a;
    }).ToList();

    var confirmationId = Guid.NewGuid().ToString("N");
    return Results.Ok(new TransferResponse(confirmationId, "ACCEPTED"));
})
.WithName("CreateTransfer")
.WithTags("Transfers")
.RequireRateLimiting("fixed");

app.Run();

// --- API Contracts (DTOs) ---
record AccountDto(string Id, string Name, string Type, decimal Balance);
record TransferRequest(string FromAccountId, string ToAccountId, decimal Amount, string? Memo);
record TransferResponse(string ConfirmationId, string Status);
