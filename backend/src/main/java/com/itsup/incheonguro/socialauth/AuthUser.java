package com.itsup.incheonguro.socialauth;

/** Provider-qualified identity prevents collisions between social accounts. */
public record AuthUser(String id, String provider, String nickname) implements java.io.Serializable {}
