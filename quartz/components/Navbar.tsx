import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

interface NavLink {
  label: string
  href: string
}

interface NavbarOptions {
  links?: NavLink[]
}

const defaultOptions: NavbarOptions = {
  links: [
    { label: "SOP 总览", href: "/sop" },
    { label: "实验预约", href: "/calendar" },
  ],
}

export default ((userOpts?: NavbarOptions) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Navbar: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <nav class={classNames(displayClass, "navbar")}>
        <ul class="navbar-links">
          {(opts.links ?? []).map((link) => (
            <li>
              <a href={link.href} class="navbar-link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  Navbar.css = `
    .navbar {
      flex: 1;
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .navbar-link {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      border-radius: 6px;
      font-size: 0.85rem;
      color: var(--darkgray);
      text-decoration: none;
      transition: color 150ms ease, background 150ms ease;
    }

    .navbar-link:hover {
      color: var(--secondary);
      background: var(--highlight);
    }
  `

  return Navbar
}) satisfies QuartzComponentConstructor<NavbarOptions>
