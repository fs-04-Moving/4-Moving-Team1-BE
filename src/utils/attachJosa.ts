export function attachJosa(
  word: string,
  josa: '을를' | '으로' | '은는' | '이가'
): string {
  const lastChar = word[word.length - 1]; // 마지막 글자 가져오기
  // const code = lastChar.charCodeAt(0) - 44032; // 유니코드 기준 시작점 뺌
  // const jong = code % 28; // 종성(받침) 추출
  // const hasBatchim = jong !== 0; // 받침 유무 판별
  const hasBatchim = (lastChar.charCodeAt(0) - 44032) % 28 !== 0;

  switch (josa) {
    case '을를':
      return word + (hasBatchim ? '을' : '를');
    case '으로':
      // 'ㄹ' 받침은 '로'가 붙음
      const code = lastChar.charCodeAt(0) - 44032;
      const jong = code % 28;
      const isRieul = jong === 8;
      return word + (!hasBatchim || isRieul ? '로' : '으로');
    case '은는':
      return word + (hasBatchim ? '은' : '는');
    case '이가':
      return word + (hasBatchim ? '이' : '가');
  }
}
