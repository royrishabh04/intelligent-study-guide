import matplotlib.pyplot as plt

# Data points derived from your benchmark runs
runs = ['Run 1', 'Run 2', 'Run 3', 'Average']
latencies = [10.5685, 8.6690, 11.5077, 10.2484]

# Initialize the plot with professional styling
plt.figure(figsize=(10, 6))
colors = ['#00bcd4', '#00bcd4', '#00bcd4', '#2196f3'] # Highlighting the Average bar
bars = plt.bar(runs, latencies, color=colors)

# Add titles and labels for technical documentation
plt.xlabel('Benchmark Test Runs', fontweight='bold')
plt.ylabel('End-to-End Latency (seconds)', fontweight='bold')
plt.title('Performance Analysis: System E2E Latency (n=3)', fontsize=14)

# Annotate each bar with the precise latency value
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2, yval + 0.1, f'{yval:.2f}s', 
             ha='center', va='bottom', fontweight='bold')

# Add a grid for quantitative clarity
plt.grid(axis='y', linestyle='--', alpha=0.7)

# Save the plot for your report
plt.savefig('latency_benchmark_final.png')
print("Plot generated successfully as latency_benchmark_final.png")