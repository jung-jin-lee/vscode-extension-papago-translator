import * as assert from 'assert';
import fetch from 'node-fetch';

export async function translate({
  text,
  clientId,
  clientSecret,
}: {
  text: string;
  clientId: string;
  clientSecret: string;
}) {
  assert(text, 'text는 필수입니다.');

  const searchParams = new URLSearchParams({
    source: 'ko',
    target: 'en',
    text: text,
  });
  const res = await fetch('https://openapi.naver.com/v1/papago/n2mt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
    body: searchParams,
  });
  const data = (await res.json()) as TranslationResponse;
  if (res.status === 401) {
    throw new Error(
      '네이버 Client Id/Secret이 유효하지 않습니다. 변경하고 다시 시도해주세요.'
    );
  }

  return { data: data, status: res.status };
}

interface TranslationResponse extends ErrorResponse {
  message: Message;
}

interface Message {
  '@type': string;
  '@service': string;
  '@version': string;
  result: Result;
}

interface Result {
  srcLangType: string;
  tarLangType: string;
  translatedText: string;
  engineType: string;
}

interface ErrorResponse {
  errorMessage?: string;
  errorCode?: string;
}
