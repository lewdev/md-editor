const parseBulletPattern = (str, regexStr, regexSplitStr, listTag) => {
  let regex = new RegExp(regexStr, "i");
  let index = 0;
  let result = str.match(regex);
  let regexSplit = new RegExp(regexSplitStr, 'i');
  while (result) {
    str = str.replace(result[0], `\n${tagIt(listTag, result[0].split(regexSplit).map(a => a.trim()?tagIt("li", a.trim()):'').join(''))}`);
    index = result.index + index + result[0].length;
    result = str.substr(index).match(regex);
  }
  return str;
};

const parseBullets = str => parseBulletPattern(str, "(\ *)([\\*\\+\\-] [^\\n]+\\n)+", "[\\*\\+\\-]", "ul");

const parseNumBullets = str => parseBulletPattern(str, "(\ *)\\d+\\. ([^\\n]+\\n)+", "\\d+\\.", "ol");

const parseHeaders = str => {//# => h1
  let regex = new RegExp(/(#+) ([^\n]+\n)/i);
  let index = 0;
  let hNum = 1;
  let result = str.match(regex);
  while (result) {
    hNum = Math.min(6, result[1].length);
    str = str.replace(result[0], tagIt("h" + hNum, result[2]));
    index = result.index + index + result[0].length;
    result = str.substr(index).match(regex);
  }
  return str;
};
const parseQuotes = str => {//> => quoteblock
  let regex = new RegExp(/>([^\n]+\n)/i);
  let index = 0;
  let result = str.match(regex);
  while (result) {
    str = str.replace(result[0], tagIt("blockquote", result[2]));
    index = result.index + index + result[0].length;
    result = str.substr(index).match(regex);
  }
  return str;
};

const parseLineBreaks = str => str.split(/[\r\n]{2,}/i).map(b => b && tagIt("p", b)).join("");

const parsePairs = str => (
  parseInlineCode(
  parseBold(
  parseItalic(
  parseStrike(
    str
  ))))
);

const parseInlineCode = str => surroundingPair(str, '`', 'code');

const parseBold = str => surroundingPair(str, '\\*\\*', 'strong');

const parseItalic = str => surroundingPair(str, '_', 'i');

const parseStrike = str => surroundingPair(str, '~~', 'strike');

const surroundingPair = (str, pair, tagName) => {
  let regex = new RegExp(`${pair}([^\n${pair}]+)${pair}`, "i");
  let index = 0;
  let result = str.match(regex);
  while (result) {
    str = str.replace(result[0], tagIt(tagName, result[1]));
    index = result.index + index + result[0].length;
    result = str.substr(index).match(regex);
  }
  return str;
};

const parseLinks = str => {
  let regex = new RegExp(/\[([^"\]]*)\]\(([^"\)]+)\)/i);
  let index = 0;
  let result = str.match(regex);
  while (result) {
    str = str.replace(result[0], tagIt(`a href="${result[2]}"`, result[1]));
    index = result.index + index + result[0].length;
    result = str.substr(index).match(regex);
  }
  return str;
};

const tagIt = (tagName, str) => str ? `<${tagName}>${str.trim()}</${tagName.split(" ")[0]}>` : '';

const parseMd = text => (
  //this handles the multiline code. We split by ``` and parse every other element
  text.replace(/\r/g, '').split(/```/).map((str, i) => i % 2 ? tagIt('pre', str) : 
  parseLineBreaks(
  parsePairs(
  parseBullets(
  parseNumBullets(
  parseLinks(
  parseHeaders(
  parseQuotes(
    str
  )))))))).join("")
);