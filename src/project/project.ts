import { ConstRVec2, ConstRVec3 } from "../geometry/rvec";

export type Color = ConstRVec3;

export type Vector = ConstRVec3;

export type Time = number;

export type Fov = number;

export type Scale = number;

export type Radius = number;

export type Thickness = number;

export type FrameDimension = number;

export type Vertices = readonly Vector[];

export type Name = string;

export type Polygon = {
    readonly vertices: Vertices;
    readonly normal: Vector;
    readonly color: Color;
}

export type Polygons = readonly Polygon[];

export type LightKind = "point" | "ambient" | "directional";

export type AmbientLight = {
    readonly kind: "ambient";
    readonly color: Color;
};

export type DirectionalLight = {
    readonly kind: "directional";
    readonly direction: Vector;
    readonly color: Color;
};

export type PointLight = {
    readonly kind: "point";
    readonly point: Vector;
    readonly radius: Radius;
    readonly color: Color;
}

export type Light = DirectionalLight | PointLight | AmbientLight;

export type Lights = readonly Light[];

export type ProjectionKind = "orthographic" | "perspective";

export type OrthographicProjection = {
    readonly kind: "orthographic";
    readonly scale: Scale;
};

export type PerspectiveProjection = {
    readonly kind: "perspective";
    readonly fovRad: Fov;
};

export type Projection = OrthographicProjection | PerspectiveProjection;

export type View = {
    readonly up: Vector;
    readonly forward: Vector;
    readonly eye: Vector;
};

export type Camera = {
    readonly view: View;
    readonly projection: Projection;
};

export type Fit = "width" | "height" | "min" | "max";

export type FrameSize = ConstRVec2;

export type Scene = {
    readonly strokeColor: Color;
    readonly strokeThickness: Thickness;
    readonly camera: Camera;
    readonly lights: Lights;
    readonly polygons: Polygons;
    readonly anchorPoint: Vector;
};

export type Keyframe = {
    readonly time: Time;
    readonly scene: Scene;
}

export type Keyframes = readonly Keyframe[]

export type Project = {
    readonly name: Name;
    readonly keyframes: Keyframes;
    readonly frameSize: FrameSize;
    readonly fit: Fit;
    readonly cullBack: boolean;
};