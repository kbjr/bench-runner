
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

#### Example

You can see an example of what a benchmark looks like by looking in the [example](https://github.com/kbjr/bench-runner/tree/master/example) directory. The `.bench-config.json` file contains the configuration for the benchmark, and looks like this:

```json
{
	"name": "Example Benchmark",
	"files": "example/**/*.js",
	"warnThreshold": 0.8,
	"failThreshold": 0.5,
	"reporters": [
		["cli", {
			"colors": true
		}]
	]
}
```

Running the benchmark can be done by with `bench run --config ./example/.bench-config.json`. You should see output something like this:

```

  Example Benchmark
  =================

  Suite: Array.forEach (2 pass, 0 warn, 0 fail)
   - Small Array (1000) x 1,903,577 ops/sec ±62.35% (88 runs sampled) [+0.00%]
   - Large Array (1000000) x 87.92 ops/sec ±0.38% (75 runs sampled) [+0.00%]

  Suite: Array.map (2 pass, 0 warn, 0 fail)
   - Small Array (1000) x 371,231 ops/sec ±8.71% (97 runs sampled) [+0.00%]
   - Large Array (1000000) x 63.38 ops/sec ±0.14% (65 runs sampled) [+0.00%]

  Benchmark Complete
  4 pass, 0 warn, 0 fail

```

Because this isn't running against an existing profile, every test passes. You can see the `[+0.00%]` on the end of each line. That's where the variance against your previous profile would normally show up. To get the real benefit though, we need a profile to compare against.

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
