import type { CrewMember } from "../lib/crew/cast";

/** Initials in a colored circle — the crew's faces. */
export default function CrewAvatar({ member, size = 28 }: { member: CrewMember; size?: number }) {
  return (
    <span
      className="crew-avatar"
      style={{ background: member.color, width: size, height: size, fontSize: size * 0.42 }}
      title={`${member.name} · ${member.tagline}`}
      aria-hidden="true"
    >
      {member.initials}
    </span>
  );
}