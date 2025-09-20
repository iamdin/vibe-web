"use client";

import { type ComponentProps, memo } from "react";
import ReactMarkdown from "react-markdown";

type ResponseProps = ComponentProps<typeof ReactMarkdown>;

export const Response = memo(
	(props: ResponseProps) => <ReactMarkdown {...props} />,
	(prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
