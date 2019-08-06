
A simple benchmark runner with reporting.

- Run your benchmarks
- Build a profile of your code's performance
- Run your benchmarks again as you change your code and have automatic reporting about when your performance shifts

#### CLI Usage

```
bench run [options]
Runs your benchmark suite

Options:
  --version         Show version number                                                                        [boolean]
  --help            Show help                                                                                  [boolean]
  --config          Your benchmark config file                                                                  [string]
  --name            The name of your benchmark (usually shows up in the test output)                            [string]
  --require         Any modules that should be required prior to running the benchmark                           [array]
  --files           Your benchmark test files                                                                    [array]
  --warn-threshold  The delta threshold below which a benchmark will throw a warning                            [number]
  --fail-threshold  The delta threshold below which a benchmark will fail                                       [number]
  --reporters       The list of reporters to use (these generate your test output)                               [array]
  --profile         The file that contains your benchmark profile you want to test against                      [string]
  --profile-out     If set, will additionally output a new benchmark profile to this file                       [string]
  ```

#### Example Config File

```json
{
	"name": "Example Benchmark",
	"files": "src/**/*.bench.js",
	"warnThreshold": 0.8,
	"failThreshold": 0.5,
	"reporters": [
		["cli", {
			"colors": true
		}]
	],
	"require": [
		"some-module/to-require"
	],
	"profile": "your-performance.bench-profile.json"
}
```
