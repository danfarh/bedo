// errors in driver & trip & car & carBrand & carColor & carModel & carType & order & auth controllers
const errorsKeys = [
  // driver
  {
    _id: '5edf8d924646dc29fc7e0ea0',
    title: 'driver not found',
    text: [
      { lang: 'en', value: 'driver not found' },
      { lang: 'az', value: 'sürücü tapılmadı' },
      { lang: 'ru', value: 'драйвер не найден' }
    ]
  },
  {
    _id: '5edf8d924646dc29fb7e0ea1',
    title: 'user not found',
    text: [
      { lang: 'en', value: 'user not found' },
      { lang: 'az', value: 'istifadəçi tapılmadı' },
      { lang: 'ru', value: 'Пользователь не найден' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ea2',
    title: 'driver does not exists',
    text: [
      { lang: 'en', value: 'driver does not exists' },
      { lang: 'az', value: 'Sürücü yoxdur' },
      { lang: 'ru', value: 'драйвер не существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ea3',
    title: 'shop does not exist',
    text: [
      { lang: 'en', value: 'shop does not exist' },
      { lang: 'az', value: 'mağaza yoxdur' },
      { lang: 'ru', value: 'магазин не существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ea4',
    title: 'driver does not belong to this shop',
    text: [
      { lang: 'en', value: 'driver does not belong to this shop' },
      { lang: 'az', value: 'Sürücü bu mağazaya aid deyil' },
      { lang: 'ru', value: 'водитель не принадлежит этому магазину' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ea5',
    title: 'your car does not exists',
    text: [
      { lang: 'en', value: 'your car does not exists' },
      { lang: 'az', value: 'avtomobiliniz yoxdur' },
      { lang: 'ru', value: 'вашей машины не существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ea6',
    title: 'car is not related to you',
    text: [
      { lang: 'en', value: 'car is not related to you' },
      { lang: 'az', value: 'maşın səninlə əlaqəli deyil' },
      { lang: 'ru', value: 'машина не связана с тобой' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ea7',
    title: 'first set your default car',
    text: [
      { lang: 'en', value: 'first set your default car' },
      { lang: 'az', value: 'əvvəlcə standart avtomobilinizi təyin edin' },
      { lang: 'ru', value: 'сначала установите машину по умолчанию' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ea8',
    title: 'you took too long please try again ',
    text: [
      { lang: 'en', value: 'you took too long please try again ' },
      { lang: 'az', value: 'çox uzun çəkdiniz, yenidən cəhd edin' },
      { lang: 'ru', value: 'вы потратили слишком много времени, пожалуйста, попробуйте еще раз' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ea9',
    title: 'maximum try count exceeded please try again later',
    text: [
      { lang: 'en', value: 'maximum try count exceeded please try again later' },
      { lang: 'az', value: 'maksimum cəhd sayı aşıldı, daha sonra yenidən cəhd edin' },
      { lang: 'ru', value: 'Превышено максимальное количество попыток, повторите попытку позже' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0eb1',
    title: 'your signUp code is incorrect',
    text: [
      { lang: 'en', value: 'your signUp code is incorrect' },
      { lang: 'az', value: 'qeydiyyat kodunuz səhvdir' },
      { lang: 'ru', value: 'ваш код регистрации неверен' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0eb2',
    title: 'Driver already exists.',
    text: [
      { lang: 'en', value: 'Driver already exists.' },
      { lang: 'az', value: 'Sürücü artıq mövcuddur.' },
      { lang: 'ru', value: 'Драйвер уже существует.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0eb3',
    title: 'maximum number of tries exceeded please try again in 10 minutes',
    text: [
      { lang: 'en', value: 'maximum number of tries exceeded please try again in 10 minutes' },
      { lang: 'az', value: 'maksimum cəhd sayı aşıldı, 10 dəqiqə sonra yenidən cəhd edin' },
      {
        lang: 'ru',
        value: 'превышено максимальное количество попыток, повторите попытку через 10 минут'
      }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0eb4',
    title: 'incorrect information',
    text: [
      { lang: 'en', value: 'incorrect information' },
      { lang: 'az', value: 'yanlış məlumat' },
      { lang: 'ru', value: 'неверная информация' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0eb5',
    title: 'shop not found',
    text: [
      { lang: 'en', value: 'shop not found' },
      { lang: 'az', value: 'qəza etdimmağaza tapılmadı' },
      { lang: 'ru', value: 'магазин не найден' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0eb6',
    title: 'driver with this phone number exists',
    text: [
      { lang: 'en', value: 'driver with this phone number exists' },
      { lang: 'az', value: 'bu telefon nömrəsi olan sürücü var' },
      { lang: 'ru', value: 'водитель с этим номером телефона существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0eb7',
    title: 'driver with this phone number  does not exists',
    text: [
      { lang: 'en', value: 'driver with this phone number  does not exists' },
      { lang: 'az', value: 'Bu telefon nömrəsi olan sürücü yoxdur' },
      { lang: 'ru', value: 'водителя с этим номером телефона не существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0eb9',
    title: 'your forgot password code is incorrect',
    text: [
      { lang: 'en', value: 'your forgot password code is incorrect' },
      { lang: 'az', value: 'unutduğunuz parol kodu səhvdir' },
      { lang: 'ru', value: 'ваш забытый пароль неверен' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ec1',
    title: 'admin does not exists',
    text: [
      { lang: 'en', value: 'admin does not exists' },
      { lang: 'az', value: 'admin yoxdur' },
      { lang: 'ru', value: 'админ не существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ec3',
    title: 'your change password code is incorrect',
    text: [
      { lang: 'en', value: 'your change password code is incorrect' },
      { lang: 'az', value: 'parol dəyişdirmə kodunuz səhvdir' },
      { lang: 'ru', value: 'ваш код изменения пароля неверен' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ec4',
    title: 'driver with this email does not exist',
    text: [
      { lang: 'en', value: 'driver with this email does not exist' },
      { lang: 'az', value: 'Bu e -poçtu olan sürücü yoxdur' },
      { lang: 'ru', value: 'драйвер с этим адресом электронной почты не существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ec5',
    title: 'please first verify your email',
    text: [
      { lang: 'en', value: 'please first verify your email' },
      { lang: 'az', value: 'zəhmət olmasa əvvəlcə e -poçtunuzu yoxlayın' },
      { lang: 'ru', value: 'пожалуйста, сначала подтвердите свою электронную почту' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ec6',
    title: 'Your forgot password code has expired please get a new forgot password code ',
    text: [
      {
        lang: 'en',
        value: 'Your forgot password code has expired please get a new forgot password code '
      },
      {
        lang: 'az',
        value:
          'Unudulmuş parol kodunuzun müddəti bitdi, zəhmət olmasa yeni bir unudulmuş parol əldə edin '
      },
      {
        lang: 'ru',
        value:
          'Срок действия вашего забытого пароля истек, пожалуйста, получите новый забытый пароль. '
      }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ec8',
    title: 'Your verification code has expired please get a new verification code ',
    text: [
      {
        lang: 'en',
        value: 'Your verification code has expired please get a new verification code '
      },
      { lang: 'az', value: 'Doğrulama kodunuzun müddəti bitdi, yeni bir doğrulama kodu əldə edin' },
      {
        lang: 'ru',
        value:
          'Срок действия вашего проверочного кода истек, пожалуйста, получите новый проверочный код'
      }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ec9',
    title: 'you already submitted a verify request',
    text: [
      { lang: 'en', value: 'you already submitted a verify request' },
      { lang: 'az', value: 'artıq yoxlama sorğusu göndərmisiniz' },
      { lang: 'ru', value: 'вы уже отправили запрос на подтверждение' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ed1',
    title: 'this driver has no active verification request',
    text: [
      { lang: 'en', value: 'this driver has no active verification request' },
      { lang: 'az', value: 'bu sürücünün aktiv yoxlama sorğusu yoxdur' },
      { lang: 'ru', value: 'у этого драйвера нет активного запроса на верификацию' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ed2',
    title: 'Driver is on a trip.',
    text: [
      { lang: 'en', value: 'Driver is on a trip.' },
      { lang: 'az', value: 'Sürücü səfərdədir.' },
      { lang: 'ru', value: 'Водитель в поездке.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ed3',
    title: 'Driver has been deleted before.',
    text: [
      { lang: 'en', value: 'Driver has been deleted before.' },
      { lang: 'az', value: 'Sürücü əvvəllər silinib.' },
      { lang: 'ru', value: 'Драйвер был удален ранее.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ed4',
    title: 'there is no suspended driver with this id',
    text: [
      { lang: 'en', value: 'there is no suspended driver with this id' },
      { lang: 'az', value: 'bu id ilə dayandırılmış sürücü yoxdur' },
      { lang: 'ru', value: 'нет приостановленного драйвера с этим идентификатором' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ed6',
    title: 'this email is already taken.',
    text: [
      { lang: 'en', value: 'this email is already taken.' },
      { lang: 'az', value: 'bu e -poçt artıq alınmışdır.' },
      { lang: 'ru', value: 'Этот электронный адрес уже используется.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ed7',
    title: 'this phone number is already taken.',
    text: [
      { lang: 'en', value: 'this phone number is already taken.' },
      { lang: 'az', value: 'bu telefon nömrəsi artıq alınmışdır.' },
      { lang: 'ru', value: 'этот номер телефона уже занят.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ee1',
    title: 'invalid address input',
    text: [
      { lang: 'en', value: 'invalid address input' },
      { lang: 'az', value: 'etibarsız ünvan girişi' },
      { lang: 'ru', value: 'неверный ввод адреса' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ee4',
    title: 'Password changed successfully.',
    text: [
      { lang: 'en', value: 'Password changed successfully.' },
      { lang: 'az', value: 'Parol uğurla dəyişdirildi.' },
      { lang: 'ru', value: 'Пароль успешно изменен.' }
    ]
  },
  // trip
  {
    _id: '5edf8d924646dc29fc7e0ee5',
    title: 'trip not found',
    text: [
      { lang: 'en', value: 'trip not found' },
      { lang: 'az', value: 'səfər tapılmadı' },
      { lang: 'ru', value: 'поездка не найдена' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ee6',
    title: 'user is not related to the trip',
    text: [
      { lang: 'en', value: 'user is not related to the trip' },
      { lang: 'az', value: 'istifadəçinin səfərlə əlaqəsi yoxdur' },
      { lang: 'ru', value: 'пользователь не имеет отношения к поездке' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ee7',
    title: 'the car has not stopped',
    text: [
      { lang: 'en', value: 'the car has not stopped' },
      { lang: 'az', value: 'maşın dayanmayıb' },
      { lang: 'ru', value: 'машина не остановилась' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ee8',
    title: 'car is stopped already',
    text: [
      { lang: 'en', value: 'car is stopped already' },
      { lang: 'az', value: 'maşın artıq dayanıb' },
      { lang: 'ru', value: 'машина уже остановлена' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ee9',
    title: 'reqCarType and tripType not match',
    text: [
      { lang: 'en', value: 'reqCarType and tripType not match' },
      { lang: 'az', value: 'reqCarType və tripType uyğun gəlmir' },
      { lang: 'ru', value: 'reqCarType и tripType не совпадают' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ae1',
    title: 'undefined reqCarType',
    text: [
      { lang: 'en', value: 'undefined reqCarType' },
      { lang: 'az', value: 'müəyyən edilməmiş reqCarType' },
      { lang: 'ru', value: 'undefined reqCarType' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ae2',
    title: 'destination location not found',
    text: [
      { lang: 'en', value: 'destination location not found' },
      { lang: 'az', value: 'təyinat yeri tapılmadı' },
      { lang: 'ru', value: 'место назначения не найдено' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ae3',
    title: 'driver car is not in destination area',
    text: [
      { lang: 'en', value: 'driver car is not in destination area' },
      { lang: 'az', value: 'sürücü maşını təyinat yerində deyil' },
      { lang: 'ru', value: 'машина водителя не в зоне назначения' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ae4',
    title: 'not found',
    text: [
      { lang: 'en', value: 'not found' },
      { lang: 'az', value: 'tapılmadı' },
      { lang: 'ru', value: 'не найден' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ae5',
    title: 'default car not found',
    text: [
      { lang: 'en', value: 'default car not found' },
      { lang: 'az', value: 'standart maşın tapılmadı' },
      { lang: 'ru', value: 'автомобиль по умолчанию не найден' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ae7',
    title: 'The driver does not belong to this shop',
    text: [
      { lang: 'en', value: 'The driver does not belong to this shop' },
      { lang: 'az', value: 'Sürücü bu mağazaya aid deyil' },
      { lang: 'ru', value: 'Водитель не принадлежит этому магазину' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ae8',
    title: 'you cant create trip',
    text: [
      { lang: 'en', value: 'you cant create trip' },
      { lang: 'az', value: 'səyahət yarada bilməzsiniz' },
      { lang: 'ru', value: 'ты не можешь создать поездку' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ae9',
    title: 'radius coefficient should not be more than ',
    text: [
      { lang: 'en', value: 'radius coefficient should not be more than' },
      { lang: 'az', value: 'radius əmsalı çox olmamalıdır' },
      { lang: 'ru', value: 'коэффициент радиуса не должен быть больше' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be1',
    title: 'please enter a valid date from today or later for reserved date',
    text: [
      { lang: 'en', value: 'please enter a valid date from today or later for reserved date' },
      {
        lang: 'az',
        value:
          'zəhmət olmasa bu gündən etibarən və ya daha sonra qorunan tarix üçün etibarlı bir tarix daxil edin'
      },
      {
        lang: 'ru',
        value:
          'пожалуйста, введите действительную дату с сегодняшнего дня или позже для зарезервированной даты'
      }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be2',
    title: 'this trip type is ride',
    text: [
      { lang: 'en', value: 'this trip type is ride' },
      { lang: 'az', value: 'bu səfər növü gəzintidir' },
      { lang: 'ru', value: 'этот тип поездки поездка' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be3',
    title: 'delivery parcel destinations does not exists',
    text: [
      { lang: 'en', value: 'delivery parcel destinations does not exists' },
      { lang: 'az', value: 'çatdırılma bağlama istiqamətləri yoxdur' },
      { lang: 'ru', value: 'адрес доставки посылки не существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be4',
    title: 'trip canceled by driver first',
    text: [
      { lang: 'en', value: 'trip canceled by driver first' },
      { lang: 'az', value: 'Sürücü əvvəlcə səyahətini ləğv etdi' },
      { lang: 'ru', value: 'поездка отменена водителем' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be5',
    title: 'send car coordinates',
    text: [
      { lang: 'en', value: 'send car coordinates' },
      { lang: 'az', value: 'avtomobil koordinatlarını göndərin' },
      { lang: 'ru', value: 'отправить координаты машины' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be6',
    title: 'trip is over you can not cancel trip',
    text: [
      { lang: 'en', value: 'trip is over you can not cancel trip' },
      { lang: 'az', value: 'səfər bitdi, səyahəti ləğv edə bilməzsən' },
      { lang: 'ru', value: 'поездка окончена вы не можете отменить поездку' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be7',
    title: 'trip already canceled',
    text: [
      { lang: 'en', value: 'trip already canceled' },
      { lang: 'az', value: 'səfər artıq ləğv edilib' },
      { lang: 'ru', value: 'поездка уже отменена' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be8',
    title: 'trip canceled by passenger first',
    text: [
      { lang: 'en', value: 'trip canceled by passenger first' },
      { lang: 'az', value: 'səyahət əvvəlcə sərnişin tərəfindən ləğv edildi' },
      { lang: 'ru', value: 'поездка отменена первым пассажиром' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0be9',
    title: 'you cant cancel this trip',
    text: [
      { lang: 'en', value: 'you cant cancel this trip' },
      { lang: 'az', value: 'bu səfəri ləğv edə bilməzsiniz' },
      { lang: 'ru', value: 'вы не можете отменить эту поездку' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ce1',
    title: 'Trip is canceled by user.',
    text: [
      { lang: 'en', value: 'Trip is canceled by user.' },
      { lang: 'az', value: 'İstifadəçi tərəfindən səfər ləğv edilir.' },
      { lang: 'ru', value: 'Поездка отменена пользователем.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ce2',
    title: 'Trip is already accepted by another driver.',
    text: [
      { lang: 'en', value: 'Trip is already accepted by another driver.' },
      { lang: 'az', value: 'Səyahət artıq başqa bir sürücü tərəfindən qəbul edilir.' },
      { lang: 'ru', value: 'Поездка уже принята другим водителем.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ce4',
    title: 'driver car not found',
    text: [
      { lang: 'en', value: 'driver car not found' },
      { lang: 'az', value: 'sürücü maşın tapılmadı' },
      { lang: 'ru', value: 'машина водителя не найдена' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ce5',
    title: 'there is no trip for you.',
    text: [
      { lang: 'en', value: 'there is no trip for you.' },
      { lang: 'az', value: 'sənin üçün heç bir səyahət yoxdur.' },
      { lang: 'ru', value: 'для тебя нет поездки.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ce6',
    title: 'type of trip is Delivery',
    text: [
      { lang: 'en', value: 'type of trip is Delivery' },
      { lang: 'az', value: 'səfər növü Çatdırılma' },
      { lang: 'ru', value: 'тип поездки Доставка' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ce7',
    title: 'this trip not a delivery trip',
    text: [
      { lang: 'en', value: 'this trip not a delivery trip' },
      { lang: 'az', value: 'bu səfər çatdırılma səfəri deyil' },
      { lang: 'ru', value: 'эта поездка не доставка' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ce8',
    title: 'this parcel has been delivered before',
    text: [
      { lang: 'en', value: 'this parcel has been delivered before' },
      { lang: 'az', value: 'bu bağlama əvvəllər çatdırılmışdır' },
      { lang: 'ru', value: 'эта посылка была доставлена ​​раньше' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ce9',
    title: 'destiantion with this order not found',
    text: [
      { lang: 'en', value: 'destiantion with this order not found' },
      { lang: 'az', value: 'bu əmr ilə təxribat tapılmadı' },
      { lang: 'ru', value: 'место назначения с этим заказом не найдено' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0aa1',
    title: 'state not match',
    text: [
      { lang: 'en', value: 'state not match' },
      { lang: 'az', value: 'dövlət uyğun gəlmir' },
      { lang: 'ru', value: 'состояние не совпадает' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0aa2',
    title: 'the car has moved already',
    text: [
      { lang: 'en', value: 'the car has moved already' },
      { lang: 'az', value: 'maşın artıq hərəkət edib' },
      { lang: 'ru', value: 'машина уже переехала' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0aa3',
    title: 'incorrect order',
    text: [
      { lang: 'en', value: 'incorrect order' },
      { lang: 'az', value: 'səhv sifariş' },
      { lang: 'ru', value: 'неправильный порядок' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0aa4',
    title: 'trip does not exists',
    text: [
      { lang: 'en', value: 'trip does not exists' },
      { lang: 'az', value: 'səfər yoxdur' },
      { lang: 'ru', value: 'поездка не существует' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0aa5',
    title: 'trip has been finished',
    text: [
      { lang: 'en', value: 'trip has been finished' },
      { lang: 'az', value: 'səyahət başa çatdı' },
      { lang: 'ru', value: 'поездка завершена' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0aa6',
    title: 'invalid order',
    text: [
      { lang: 'en', value: 'invalid order' },
      { lang: 'az', value: 'etibarsız sifariş' },
      { lang: 'ru', value: 'недействительный заказ' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0aa7',
    title: 'destinations is empty',
    text: [
      { lang: 'en', value: 'destinations is empty' },
      { lang: 'az', value: 'istiqamətlər boşdur' },
      { lang: 'ru', value: 'направления пусто' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0aa8',
    title: 'kind of trip is not delivery',
    text: [
      { lang: 'en', value: 'kind of trip is not delivery' },
      { lang: 'az', value: 'bir növ çatdırılma deyil' },
      { lang: 'ru', value: 'вид поездки не доставка' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ba2',
    title: 'it is not allowed to cancel this trip',
    text: [
      { lang: 'en', value: 'it is not allowed to cancel this trip' },
      { lang: 'az', value: 'bu səfərin ləğv edilməsinə icazə verilmir' },
      { lang: 'ru', value: 'нельзя отменять эту поездку' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ba3',
    title: 'The cancellation time has passed.',
    text: [
      { lang: 'en', value: 'The cancellation time has passed.' },
      { lang: 'az', value: 'Ləğv etmə vaxtı keçdi.' },
      { lang: 'ru', value: 'Время отмены прошло.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ba4',
    title: 'trip  has been ended before.',
    text: [
      { lang: 'en', value: 'trip  has been ended before.' },
      { lang: 'az', value: 'səfər daha əvvəl başa çatdı.' },
      { lang: 'ru', value: 'поездка была закончена раньше.' }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ba5',
    title: 'you are not allowed to end a trip which is in searching state.',
    text: [
      { lang: 'en', value: 'you are not allowed to end a trip which is in searching state.' },
      { lang: 'az', value: 'axtarış vəziyyətində olan bir səfərə son qoymağa icazə verilmir' },
      {
        lang: 'ru',
        value: 'вам не разрешено завершать поездку, которая находится в состоянии поиска'
      }
    ]
  },
  {
    _id: '5edf8d924646dc29fc7e0ba6',
    title: 'You accepted too late.',
    text: [
      { lang: 'en', value: 'You accepted too late.' },
      { lang: 'az', value: 'Çox gec qəbul etdiniz.' },
      { lang: 'ru', value: 'Вы согласились слишком поздно.' }
    ]
  },
  // car
  {
    _id: '612a2ec3c3d11d19c8534435',
    title: 'This plate number is used by another car.',
    text: [
      { lang: 'en', value: 'This plate number is used by another car.' },
      { lang: 'az', value: 'Bu nömrə başqa bir avtomobildə istifadə olunur.' },
      { lang: 'ru', value: 'Этот номерной знак используется другим автомобилем.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534436',
    title: 'your brand does not exists',
    text: [
      { lang: 'en', value: 'your brand does not exists' },
      { lang: 'az', value: 'markanız yoxdur' },
      { lang: 'ru', value: 'вашего бренда не существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534437',
    title: 'your model does not exists',
    text: [
      { lang: 'en', value: 'your model does not exists' },
      { lang: 'az', value: 'modeliniz yoxdur' },
      { lang: 'ru', value: 'вашей модели не существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534438',
    title: 'your color does not exists',
    text: [
      { lang: 'en', value: 'your color does not exists' },
      { lang: 'az', value: 'rənginiz yoxdur' },
      { lang: 'ru', value: 'вашего цвета не существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534439',
    title: 'your car type does not exists',
    text: [
      { lang: 'en', value: 'your car type does not exists' },
      { lang: 'az', value: 'avtomobilinizin növü yoxdur' },
      { lang: 'ru', value: 'вашего типа машины не существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534442',
    title: 'you can not remove your favorite car',
    text: [
      { lang: 'en', value: 'you can not remove your favorite car' },
      { lang: 'az', value: 'sevdiyiniz avtomobili çıxara bilməzsiniz' },
      { lang: 'ru', value: 'нельзя снимать любимую машину' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534443',
    title: 'Your car has been removed',
    text: [
      { lang: 'en', value: 'Your car has been removed' },
      { lang: 'az', value: 'Avtomobiliniz çıxarılıb' },
      { lang: 'ru', value: 'Ваш автомобиль был удален' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534444',
    title: 'Car does not exist.',
    text: [
      { lang: 'en', value: 'Car does not exist.' },
      { lang: 'az', value: 'Maşın yoxdur.' },
      { lang: 'ru', value: 'Машины не существует.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534445',
    title: 'Driver is online with this car.',
    text: [
      { lang: 'en', value: 'Driver is online with this car.' },
      { lang: 'az', value: 'Sürücü bu maşınla onlayndır.' },
      { lang: 'ru', value: 'Водитель онлайн с этой машиной.' }
    ]
  },
  // car brand
  {
    _id: '612a2ec3c3d11d19c8534455',
    title: 'Brands added successfully',
    text: [
      { lang: 'en', value: 'Brands added successfully' },
      { lang: 'az', value: 'Markalar uğurla əlavə edildi' },
      { lang: 'ru', value: 'Бренды успешно добавлены' }
    ]
  },
  // car Color
  {
    _id: '612a2ec3c3d11d19c8534462',
    title: 'Colors added successfully',
    text: [
      { lang: 'en', value: 'Colors added successfully' },
      { lang: 'az', value: 'Rənglər uğurla əlavə edildi' },
      { lang: 'ru', value: 'Цвета успешно добавлены' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534463',
    title: 'Color does not exist.',
    text: [
      { lang: 'en', value: 'Color does not exist.' },
      { lang: 'az', value: 'Rəng yoxdur.' },
      { lang: 'ru', value: 'Цвета не существует.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534464',
    title: 'Color has deleted before.',
    text: [
      { lang: 'en', value: 'Color has deleted before.' },
      { lang: 'az', value: 'Rəng əvvəllər silinib.' },
      { lang: 'ru', value: 'Цвет удалил раньше.' }
    ]
  },
  // car Model
  {
    _id: '612a2ec3c3d11d19c8534466',
    title: 'Car model With this name exists.',
    text: [
      { lang: 'en', value: 'Car model With this name exists.' },
      { lang: 'az', value: 'Bu adı olan avtomobil modeli var.' },
      { lang: 'ru', value: 'Модель автомобиля с таким названием существует.' }
    ]
  },
  // order
  {
    _id: '612a2ec3c3d11d19c8534474',
    title: 'There is no routes between your address and your selected shop.',
    text: [
      { lang: 'en', value: 'There is no routes between your address and your selected shop.' },
      { lang: 'az', value: 'Ünvanınızla seçdiyiniz mağaza arasında heç bir yol yoxdur.' },
      { lang: 'ru', value: 'Между вашим адресом и выбранным вами магазином нет маршрутов.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534475',
    title: 'unable to calculate shipping price',
    text: [
      { lang: 'en', value: 'unable to calculate shipping price' },
      { lang: 'az', value: 'çatdırılma qiymətini hesablaya bilmir' },
      { lang: 'ru', value: 'невозможно рассчитать стоимость доставки' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534477',
    title: 'cart not found',
    text: [
      { lang: 'en', value: 'cart not found' },
      { lang: 'az', value: 'araba tapılmadı' },
      { lang: 'ru', value: 'корзина не найдена' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534478',
    title: 'category not found',
    text: [
      { lang: 'en', value: 'category not found' },
      { lang: 'az', value: 'kateqoriya tapılmadı' },
      { lang: 'ru', value: 'категория не найдена' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534479',
    title: 'order not found!',
    text: [
      { lang: 'en', value: 'order not found!' },
      { lang: 'az', value: 'sifariş tapılmadı!' },
      { lang: 'ru', value: 'заказ не найден!' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534480',
    title: 'order receiver not found',
    text: [
      { lang: 'en', value: 'order receiver not found' },
      { lang: 'az', value: 'sifariş qəbuledicisi tapılmadı' },
      { lang: 'ru', value: 'получатель заказа не найден' }
    ]
  },
  // auth
  {
    _id: '612a2ec3c3d11d19c8534481',
    title: 'invalid token',
    text: [
      { lang: 'en', value: 'invalid token' },
      { lang: 'az', value: 'Yanlış Token' },
      { lang: 'ru', value: 'недействительный токен' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534482',
    title: 'undefind role',
    text: [
      { lang: 'en', value: 'undefind role' },
      { lang: 'az', value: 'təyin olunmamış rol' },
      { lang: 'ru', value: 'неопределенная роль' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534483',
    title: 'user with this phone number exists',
    text: [
      { lang: 'en', value: 'user with this phone number exists' },
      { lang: 'az', value: 'bu telefon nömrəsi olan istifadəçi var' },
      { lang: 'ru', value: 'пользователь с этим номером телефона существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534484',
    title: 'Email already exists',
    text: [
      { lang: 'en', value: 'Email already exists' },
      { lang: 'az', value: 'Elektron poçt ünvanı artıq mövcuddur' },
      { lang: 'ru', value: 'адрес электронной почты уже существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534485',
    title: 'you took too long please try again.',
    text: [
      { lang: 'en', value: 'you took too long please try again.' },
      { lang: 'az', value: 'çox uzun çəkdiniz, yenidən cəhd edin.' },
      { lang: 'ru', value: 'вы потратили слишком много времени, пожалуйста, попробуйте еще раз.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534487',
    title: 'user already exists.',
    text: [
      { lang: 'en', value: 'user already exists.' },
      { lang: 'az', value: 'istifadəçi artıq mövcuddur.' },
      { lang: 'ru', value: 'Пользователь уже существует.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534488',
    title: 'your signUp code is incorrect.',
    text: [
      { lang: 'en', value: 'your signUp code is incorrect.' },
      { lang: 'az', value: 'qeydiyyat kodunuz səhvdir.' },
      { lang: 'ru', value: 'ваш код регистрации неверен.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534491',
    title: 'user with this phone number  does not exists',
    text: [
      { lang: 'en', value: 'user with this phone number  does not exists' },
      { lang: 'az', value: 'bu telefon nömrəsi olan istifadəçi yoxdur' },
      { lang: 'ru', value: 'пользователя с этим номером телефона не существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534498',
    title: 'Password changed successfully',
    text: [
      { lang: 'en', value: 'Password changed successfully' },
      { lang: 'az', value: 'Parol uğurla dəyişdirildi' },
      { lang: 'ru', value: 'Пароль успешно изменен' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534499',
    title: 'user with this email does not exist',
    text: [
      { lang: 'en', value: 'user with this email does not exist' },
      { lang: 'az', value: 'bu e -poçtu olan istifadəçi yoxdur' },
      { lang: 'ru', value: 'пользователь с этим адресом электронной почты не существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534511',
    title: 'your email verification code is incorrect',
    text: [
      { lang: 'en', value: 'your email verification code is incorrect' },
      { lang: 'az', value: 'e -poçt doğrulama kodunuz səhvdir' },
      { lang: 'ru', value: 'ваш код подтверждения электронной почты неверен' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534517',
    title: 'This email is taken by another user.',
    text: [
      { lang: 'en', value: 'This email is taken by another user.' },
      { lang: 'az', value: 'Bu e -poçt başqa bir istifadəçi tərəfindən alınmışdır.' },
      { lang: 'ru', value: 'Это электронное письмо забрал другой пользователь.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534518',
    title: 'This email is taken by another driver.',
    text: [
      { lang: 'en', value: 'This email is taken by another driver.' },
      { lang: 'az', value: 'Bu e -poçt başqa bir sürücü tərəfindən alınır.' },
      { lang: 'ru', value: 'Это электронное письмо забрал другой водитель.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534519',
    title: 'user already exists',
    text: [
      { lang: 'en', value: 'user already exists' },
      { lang: 'az', value: 'istifadəçi artıq mövcuddur' },
      { lang: 'ru', value: 'Пользователь уже существует' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534520',
    title: 'your verification code is incorrect',
    text: [
      { lang: 'en', value: 'your verification code is incorrect' },
      { lang: 'az', value: 'doğrulama kodunuz səhvdir' },
      { lang: 'ru', value: 'ваш проверочный код неверен' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534521',
    title: 'maximum try count exceeded please try again later.',
    text: [
      { lang: 'en', value: 'maximum try count exceeded please try again later.' },
      { lang: 'az', value: 'maksimum cəhd sayı aşıldı, daha sonra yenidən cəhd edin.' },
      { lang: 'ru', value: 'Превышено максимальное количество попыток, повторите попытку позже.' }
    ]
  },
  {
    _id: '612a2ec3c3d11d19c8534522',
    title: 'user does not exists',
    text: [
      { lang: 'en', value: 'user does not exists' },
      { lang: 'az', value: 'istifadəçi yoxdur' },
      { lang: 'ru', value: 'пользователь не существует' }
    ]
  }
]

export default errorsKeys
