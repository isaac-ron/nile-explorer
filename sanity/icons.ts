/**
 * Every icon the Studio uses, in one place.
 *
 * Icons are not decoration here. The menu and the document lists were a wall
 * of identical grey rows, which is slow to scan and gives an editor nothing to
 * aim at — you read every label because nothing is recognisable at a glance.
 *
 * Two things to know before adding one.
 *
 * `@sanity/icons` v5 removed the root-entry named exports. `import
 * {TagIcon} from '@sanity/icons'` still type-checks against a deprecated
 * `never` and fails at runtime; each icon now comes from its own subpath, as
 * below. There are 236 of them — `Object.keys(require('@sanity/icons').icons)`
 * lists the kebab-case names, and the subpath is that name in PascalCase.
 *
 * Keep an icon meaning one thing. Microphone is the show, Play is an episode
 * of it; if both were Microphone the menu would be decorated rather than
 * navigable, which is where the wall of grey came from in the first place.
 */

export { DocumentTextIcon } from '@sanity/icons/DocumentText';
export { UsersIcon } from '@sanity/icons/Users';
export { TagIcon } from '@sanity/icons/Tag';
export { PlayIcon } from '@sanity/icons/Play';
export { MicrophoneIcon } from '@sanity/icons/Microphone';
export { VideoIcon } from '@sanity/icons/Video';
export { MasterDetailIcon } from '@sanity/icons/MasterDetail';
export { CalendarIcon } from '@sanity/icons/Calendar';
export { InfoOutlineIcon } from '@sanity/icons/InfoOutline';
export { CogIcon } from '@sanity/icons/Cog';
export { DocumentsIcon } from '@sanity/icons/Documents';
export { ChartUpwardIcon } from '@sanity/icons/ChartUpward';
export { EyeOpenIcon } from '@sanity/icons/EyeOpen';
export { LaunchIcon } from '@sanity/icons/Launch';
export { HomeIcon } from '@sanity/icons/Home';
export { AddIcon } from '@sanity/icons/Add';
