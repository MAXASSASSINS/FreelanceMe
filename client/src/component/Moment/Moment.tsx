import moment from "moment";

type MomentInput = string | number | Date | null | undefined;

interface MomentProps {
  children?: MomentInput;
  format?: string;
  fromNow?: boolean;
  ago?: boolean;
  parse?: string;
  className?: string;
}

export default function Moment({
  children,
  format,
  fromNow,
  ago,
  parse,
  className,
}: MomentProps) {
  if (children == null || children === "") return null;

  const m = parse
    ? moment(children as moment.MomentInput, parse)
    : moment(children as moment.MomentInput);

  if (!m.isValid()) return null;

  const text = fromNow ? m.fromNow(ago) : m.format(format);
  return <time className={className}>{text}</time>;
}