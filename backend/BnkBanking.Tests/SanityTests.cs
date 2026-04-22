using FluentAssertions;
using Xunit;

namespace BnkBanking.Tests;

public class SanityTests
{
    [Fact]
    public void Math_Still_Works()
    {
        (2 + 2).Should().Be(4);
    }
}
