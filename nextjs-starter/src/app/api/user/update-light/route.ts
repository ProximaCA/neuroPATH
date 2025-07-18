import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '../../../../lib/kv-store';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();
    
    if (!userId || amount === undefined) {
      return NextResponse.json(
        { error: 'userId и amount обязательны' },
        { status: 400 }
      );
    }

    // Получаем текущие данные пользователя
    const { getUser } = await import('../../../../lib/kv-store');
    const currentUser = await getUser(userId);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что баланс не станет отрицательным
    const newBalance = currentUser.light_balance + amount;
    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'Недостаточно света' },
        { status: 400 }
      );
    }

    // Обновляем баланс
    const updatedUser = await updateUser(userId, {
      light_balance: newBalance
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Не удалось обновить пользователя' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.light_balance,
      message: amount > 0 ? 'Свет добавлен' : 'Свет потрачен'
    });

  } catch (error) {
    console.error('Ошибка обновления света:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 