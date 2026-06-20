import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { adminCode } = await req.json();

    if (!adminCode || adminCode !== process.env.ADMIN_CODE) {
      return NextResponse.json({ error: '관리자 코드가 올바르지 않습니다.' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
