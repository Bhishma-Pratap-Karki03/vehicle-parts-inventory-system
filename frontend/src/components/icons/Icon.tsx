export type IconName =
  | 'alert'
  | 'arrowBack'
  | 'bell'
  | 'book'
  | 'box'
  | 'check'
  | 'checkCircle'
  | 'chevronLeft'
  | 'chevronRight'
  | 'delete'
  | 'edit'
  | 'expandMore'
  | 'filterOff'
  | 'image'
  | 'info'
  | 'payments'
  | 'plus'
  | 'search'
  | 'view'
  | 'warning'

type IconProps = {
  name: IconName
  className?: string
  title?: string
}

const materialIconNames: Record<IconName, string> = {
  alert: 'error',
  arrowBack: 'arrow_back',
  bell: 'notifications_active',
  book: 'menu_book',
  box: 'inventory_2',
  check: 'check',
  checkCircle: 'check_circle',
  chevronLeft: 'chevron_left',
  chevronRight: 'chevron_right',
  delete: 'delete',
  edit: 'edit',
  expandMore: 'expand_more',
  filterOff: 'filter_alt_off',
  image: 'image',
  info: 'info',
  payments: 'payments',
  plus: 'add',
  search: 'search',
  view: 'visibility',
  warning: 'warning',
}

function Icon({ name, className = 'text-[20px]', title }: IconProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={`material-symbols-outlined inline-flex select-none items-center justify-center leading-none not-italic ${className}`}
      role={title ? 'img' : undefined}
    >
      {materialIconNames[name]}
    </span>
  )
}

export default Icon
