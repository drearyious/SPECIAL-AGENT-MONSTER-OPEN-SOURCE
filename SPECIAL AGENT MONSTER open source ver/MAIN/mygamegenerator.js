if (typeof process !== "undefined" && typeof require !== "undefined") {
  fs = require("fs");
  vm = require("vm");
  vm.runInThisContext(fs.readFileSync("headless.js"), "headless.js");
  args = process.argv;
  args.shift();
  args.shift();

  gameDir = args[0] || "mygame";
  beta = args[1];
  rootDir = null;
  try {
    console.log(generateMygame(gameDir, beta, fs, rootDir));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}


function generateMygame(gameDir = "mygame", beta, fs, rootDir = null) {
  var output = "";

  function parseSceneList(lines, startIndex) {
    var indentExpected = null;
    var scenes = [];
    var purchases = {};
    var line;
    var i = startIndex;

    while (typeof (line = lines[++i]) != "undefined") {
      if (!line.trim()) continue;

      var indent = /^(\s*)/.exec(line)[1].length;

      // first non-empty line after *scene_list sets expected indent (must not be zero)
      if (indentExpected === null) {
        if (indent === 0) throw new Error("invalid scene_list indent, expected at least one row");
        indentExpected = indent;
      }

      // a zero indent means scene_list block ended
      if (indent === 0) {
        i--; // step back so caller's loop sees this line
        break;
      }

      if (indent !== indentExpected) {
        throw new Error("invalid scene_list indent, expected " + indentExpected + ", was " + indent);
      }

      var content = line.trim();
      var purchaseMatch = /^\$(\w*)\s+(.*)/.exec(content);
      if (purchaseMatch) {
        var product = purchaseMatch[1].trim() || "adfree";
        content = purchaseMatch[2];
        purchases[content] = product;
      }

      // collect scene name
      scenes.push(content);
    }

    return { scenes: scenes, purchases: purchases, lineNum: i };
  }

  function parseAchievement(data, lines, lineNum) {
    var nextIndent = null;
    var parsed = /(\S+)\s+(\S+)\s+(\S+)\s+(.*)/.exec(data);
    var achievementName = parsed[1] = parsed[1].toLowerCase();
    var visibility = parsed[2];
    var visible = (visibility != "hidden");
    parsed[2] = visible;
    var pointString = parsed[3];
    parsed[3] = pointString * 1;
    var title = parsed[4];
    var line = lines[++lineNum];
    var preEarnedDescription = line.trim();
    parsed[6] = preEarnedDescription;

    var postEarnedDescription = null;
    while (typeof (line = lines[++lineNum]) != "undefined") {
      if (line.trim()) break;
    }
    if (/^\s/.test(line)) {
      postEarnedDescription = line.trim();
    } else {
      lineNum--;
    }
    if (postEarnedDescription === null) postEarnedDescription = preEarnedDescription;
    parsed[5] = postEarnedDescription;
    parsed.shift();
    achievements.push(parsed);
    return lineNum;
  }

  function parseCheckPurchase(data) {
    var products = data.split(" ");
    for (var i = 0; i < products.length; i++) {
      var product = products[i];
      if (!productMap[product]) {
        purchases["fake:" + product] = product;
      }
    }
  }

  function parseCreateValue(value) {
    if (/^true$/i.test(value)) value = "true";
    if (/^false$/i.test(value)) value = "false";
    if (/^".*"$/.test(value)) value = value.slice(1, -1).replace(/\\(.)/g, "$1");
    return value;
  }

  function parseCreateArray(line) {
    var result = /^(\w+)\s+(.*)/.exec(line);
    var variable = result[1].toLowerCase();
    var values = result[2].split(/\s+/);
    var length = Number(values.shift());
    if (values.length === 1) {
      var value = parseCreateValue(values[0]);
      for (var i = 0; i < length; i++) {
        stats[variable + "_" + (i + 1)] = value;
      }
    } else {
      for (var i = 0; i < length; i++) {
        var value = parseCreateValue(values[i]);
        stats[variable + "_" + (i + 1)] = value;
      }
    }
  }

  var lines = slurpFileLines((rootDir ?? "web/") + gameDir + "/scenes/startup.txt");
  var stats = {}, purchases = {}, productMap = {};
  var scenes = ["startup"];
  var create = /^\*create +(\w+) +(.*)/;
  var result, variable, value;
  var achievements = [];

  var ignoredInitialCommands = { "comment": 1, "author": 1, "ifid": 1 };

  for (var i = 0; i < lines.length; i++) {
    var line = ("" + lines[i]).trim();
    if (!line) { continue; }
    var result = /^\s*\*(\w+)(.*)/.exec(line);
    if (!result) break;
    var command = result[1].toLowerCase();
    var data = result[2].trim();
    if (ignoredInitialCommands[command]) { continue; }
    else if (command == "create") {
      var result = /^(\w*)(.*)/.exec(data);
      variable = result[1];
      value = parseCreateValue(result[2].trim());
      stats[variable.toLowerCase()] = value;
    } else if (command == "create_array") {
      parseCreateArray(data);
    } else if (command == "scene_list") {
      result = parseSceneList(lines, i);
      // if scene_list returns any scenes, use them (overrides default startup-only)
      if (result.scenes && result.scenes.length) {
        scenes = result.scenes.slice(); // copy
      } else {
        scenes = ["startup"];
      }
      purchases = result.purchases;
      i = result.lineNum;
    } else if (command == "title") {
      stats.choice_title = data;
    } else if (command == "achievement") {
      i = parseAchievement(data, lines, i);
    } else if (command == "product") {
      // ignore products for now
    } else if (command === "bug") {
      if (beta === '"beta"' && data === "choice_beta") {
        continue;
      }
      console.error("startup.txt contains *bug");
      process.exit(1);
    } else {
      break;
    }
  }

  for (var scene in purchases) {
    productMap[purchases[scene]] = scene;
  }

  if (fs) {
    var sceneDir = fs.readdirSync("web/" + gameDir + "/scenes");
    for (i = 0; i < sceneDir.length; i++) {
      var lines = slurpFileLines("web/" + gameDir + "/scenes/" + sceneDir[i]);
      for (var j = 0; j < lines.length; j++) {
        var line = ("" + lines[j]).trim();
        if (!line) { continue; }
        var result = /^\s*\*(\w+)(.*)/.exec(line);
        if (!result) continue;
        var command = result[1].toLowerCase();
        var data = result[2].trim();
        if (command == "check_purchase") {
          parseCheckPurchase(data);
        } else if (command == "delay_ending") {
          purchases["fake:skiponce"] = "skiponce";
        }
      }
    }
  }

  // Ensure startup is first in the list (move it to front if present, or add it)
  if (!scenes.includes("startup")) {
    scenes.unshift("startup");
  } else {
    scenes = ["startup", ...scenes.filter(s => s !== "startup")];
  }

  output += ("\ufeffnav = new SceneNavigator(");

  function logJson(x) {
    var json = JSON.stringify(x, null, " ");
    json = json.replace(/[\u007f-\uffff]/g, function (c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    });
    output += (json);
  }

  logJson(scenes);
  output += (");\nstats = ");
  logJson(stats);
  output += (";\npurchases = ");
  logJson(purchases);
  output += (";\nachievements = ");
  logJson(achievements);
  output += (";\n");

  if (beta === '"beta"' || beta === '"beta-iap"') {
    output += ("beta = " + beta + ";\n");
    const betaPassword = slurpFile("beta-password.txt").trim();
    output += (`betaPassword = "${btoa(`beta:${betaPassword}`)}";`);
  }

  output += ("nav.setStartingStatsClone(stats);");
  output += ("if (achievements.length) {\n  nav.loadAchievements(achievements);\n}");
  output += ("\nif (nav.loadProducts) nav.loadProducts([], purchases);\n");
  return output;
}
