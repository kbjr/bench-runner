
A simple benchmark runner with reporting.

- Run your benchmarks
- Build a profile of your code's performance
- Run your benchmarks again as you change your code and have automatic reporting about when your performance shifts

```bash
$ npm install @k/bench-runner
```

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

#### Building and Using Profiles

Building a profile is as easy as passing in an extra option when running your benchmarks

```bash
bench run ... --profile-out your-profile.json
```

This will create a new file `your-profile.json` containing your benchmark profile. You can then compare later runs against this profile by passing the file back in with the `profile` option.

```bash
bench run ... --profile your-profile.json
```

These later runs will compare the new performance against the expectations set in the profile, and if they vary too much, it will throw out a warning or an error. You can control how much variance to allow by setting the threshold options

```bash
bench run ... --warn-threshold 0.8 --fail-threshold 0.5
```

The thresholds are a ratio you expect to meet. Setting `--warn-threshold` to `0.8` means that if performance degrades down to 80% or lower of what's recorded in the profile, that test will throw a warning.

Don't set your thresholds too strictly, however. Microbenchmarks tend to give inherently variable results based on all kinds of various conditions you may not be aware of. This tool is meant as a sanity test more than anything; To catch unexpected, large shifts in relative performance.
