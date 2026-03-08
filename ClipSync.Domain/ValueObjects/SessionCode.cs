namespace ClipSync.Domain.ValueObjects;

public static class SessionCode
{
    // Exclude ambiguous characters: 0/O, 1/I/L
    private const string AllowedChars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static readonly Random _random = new();

    public static string Generate(int length = 6)
    {
        var chars = new char[length];
        for (int i = 0; i < length; i++)
        {
            chars[i] = AllowedChars[_random.Next(AllowedChars.Length)];
        }
        return new string(chars);
    }
}
